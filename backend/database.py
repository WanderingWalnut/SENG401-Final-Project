import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv
import logging

load_dotenv()

class DatabaseConnection:
    _instance = None
    _connection = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DatabaseConnection, cls).__new__(cls)
            cls._initialize_connection()
        return cls._instance

    @classmethod
    def _initialize_connection(cls):
        try:
            cls._connection = mysql.connector.connect(
                host=os.getenv("MYSQLHOST"),
                user=os.getenv("MYSQLUSER"),
                password=os.getenv("MYSQLPASSWORD"),
                database=os.getenv("MYSQLDATABASE"),
                port=os.getenv("MYSQLPORT"),
                pool_size=5,
                pool_name="budgetwise_pool",
                pool_reset_session=True
            )
            logging.info("Database connection pool created")
        except Error as e:
            logging.error(f"Database connection failed: {e}")
            raise

    @classmethod
    def get_connection(cls):
        if not cls._connection.is_connected():
            cls._connection.reconnect(attempts=3, delay=5)
        return cls._connection

    @classmethod
    def close_connection(cls):
        if cls._connection.is_connected():
            cls._connection.close()
            logging.info("Database connection closed")

def get_db():
    return DatabaseConnection().get_connection()

def close_db_connection():
    DatabaseConnection.close_connection()