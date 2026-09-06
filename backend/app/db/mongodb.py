import logging
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings

logger = logging.getLogger("ats.db")

class DatabaseManager:
    client: Optional[AsyncIOMotorClient] = None
    db: Optional[AsyncIOMotorDatabase] = None
    is_connected: bool = False
    
    # In-memory fallback if MongoDB instance is not reachable
    _memory_users: Dict[str, Dict[str, Any]] = {}
    _memory_otps: Dict[str, Dict[str, Any]] = {}
    _memory_scans: List[Dict[str, Any]] = []

    async def connect(self):
        try:
            logger.info(f"Connecting to MongoDB at {settings.MONGODB_URI}...")
            self.client = AsyncIOMotorClient(
                settings.MONGODB_URI,
                serverSelectionTimeoutMS=2500
            )
            # Test ping
            await self.client.admin.command('ping')
            self.db = self.client[settings.DATABASE_NAME]
            self.is_connected = True
            logger.info(f"Successfully connected to MongoDB database '{settings.DATABASE_NAME}'!")
            
            # Setup indexes
            await self._init_indexes()
        except Exception as e:
            self.is_connected = False
            logger.warning(
                f"MongoDB connection failed: {e}. "
                "Running in In-Memory Fallback mode. "
                "To connect to a live MongoDB instance, ensure mongod is running or update MONGODB_URI in .env."
            )

    async def _init_indexes(self):
        if not self.is_connected or self.db is None:
            return
        try:
            # TTL Index on otps collection to auto-delete expired OTPs
            await self.db.otps.create_index("expires_at", expireAfterSeconds=0)
            # Unique index on users email
            await self.db.users.create_index("email", unique=True)
            # Index on scans
            await self.db.scans.create_index([("user_email", 1), ("created_at", -1)])
            logger.info("MongoDB indexes (including TTL for OTPs) verified.")
        except Exception as e:
            logger.error(f"Error creating indexes: {e}")

    async def close(self):
        if self.client:
            self.client.close()
            logger.info("MongoDB connection closed.")

    # --- Users Collection Operations ---
    async def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        email = email.lower().strip()
        if self.is_connected and self.db is not None:
            user = await self.db.users.find_one({"email": email})
            if user:
                user["id"] = str(user["_id"])
            return user
        return self._memory_users.get(email)

    async def upsert_user(self, email: str) -> Dict[str, Any]:
        email = email.lower().strip()
        now = datetime.now(timezone.utc)
        if self.is_connected and self.db is not None:
            await self.db.users.update_one(
                {"email": email},
                {"$set": {"last_login": now}, "$setOnInsert": {"email": email, "created_at": now}},
                upsert=True
            )
            return await self.get_user_by_email(email)
        
        if email not in self._memory_users:
            self._memory_users[email] = {
                "id": str(len(self._memory_users) + 1),
                "email": email,
                "created_at": now.isoformat(),
                "last_login": now.isoformat()
            }
        else:
            self._memory_users[email]["last_login"] = now.isoformat()
        return self._memory_users[email]

    # --- OTP Collection Operations ---
    async def save_otp(self, email: str, hashed_otp: str, expires_at: datetime):
        email = email.lower().strip()
        record = {
            "email": email,
            "hashed_otp": hashed_otp,
            "attempts": 0,
            "created_at": datetime.now(timezone.utc),
            "expires_at": expires_at
        }
        if self.is_connected and self.db is not None:
            # Replace existing OTP for this email
            await self.db.otps.replace_one({"email": email}, record, upsert=True)
            return
        self._memory_otps[email] = record

    async def get_otp(self, email: str) -> Optional[Dict[str, Any]]:
        email = email.lower().strip()
        if self.is_connected and self.db is not None:
            return await self.db.otps.find_one({"email": email})
        return self._memory_otps.get(email)

    async def increment_otp_attempts(self, email: str):
        email = email.lower().strip()
        if self.is_connected and self.db is not None:
            await self.db.otps.update_one({"email": email}, {"$inc": {"attempts": 1}})
            return
        if email in self._memory_otps:
            self._memory_otps[email]["attempts"] = self._memory_otps[email].get("attempts", 0) + 1

    async def delete_otp(self, email: str):
        email = email.lower().strip()
        if self.is_connected and self.db is not None:
            await self.db.otps.delete_many({"email": email})
            return
        self._memory_otps.pop(email, None)

    # --- Scans Collection Operations ---
    async def save_scan(self, scan_data: Dict[str, Any]) -> str:
        if self.is_connected and self.db is not None:
            result = await self.db.scans.insert_one(scan_data)
            return str(result.inserted_id)
        
        scan_id = str(len(self._memory_scans) + 1)
        scan_data["id"] = scan_id
        self._memory_scans.insert(0, scan_data)
        return scan_id

    async def get_user_scans(self, email: str, limit: int = 20) -> List[Dict[str, Any]]:
        email = email.lower().strip()
        if self.is_connected and self.db is not None:
            cursor = self.db.scans.find({"user_email": email}).sort("created_at", -1).limit(limit)
            scans = []
            async for doc in cursor:
                doc["id"] = str(doc.pop("_id"))
                scans.append(doc)
            return scans
        
        return [s for s in self._memory_scans if s.get("user_email") == email][:limit]

    async def get_scan_by_id(self, scan_id: str, email: str) -> Optional[Dict[str, Any]]:
        email = email.lower().strip()
        if self.is_connected and self.db is not None:
            from bson import ObjectId
            try:
                doc = await self.db.scans.find_one({"_id": ObjectId(scan_id), "user_email": email})
                if doc:
                    doc["id"] = str(doc.pop("_id"))
                return doc
            except Exception:
                return None
        
        for s in self._memory_scans:
            if str(s.get("id")) == str(scan_id) and s.get("user_email") == email:
                return s
        return None

db_manager = DatabaseManager()
