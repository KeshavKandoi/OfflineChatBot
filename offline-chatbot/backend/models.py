from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import String
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from datetime import datetime
from sqlalchemy import ForeignKey

class Base(DeclarativeBase):
  pass


class User(Base):
  __tablename__ = "user"

  id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
  name: Mapped[str] = mapped_column(String(255))
  username: Mapped[str] = mapped_column(String(255), unique=True)
  email: Mapped[str] = mapped_column(String(255), unique=True)
  password_hash: Mapped[str] = mapped_column(String(255))
  created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)


class Session(Base):
  __tablename__ = "session"

  id: Mapped[str] = mapped_column(primary_key=True)
  title: Mapped[str] = mapped_column(String(255))
  user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=True)
  created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)


class Message(Base):
  __tablename__ = "message"

  id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
  session_id: Mapped[str] = mapped_column(ForeignKey("session.id"))
  role: Mapped[str] = mapped_column(String(255))
  content: Mapped[str] = mapped_column(String(255))
  created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)