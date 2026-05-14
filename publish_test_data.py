#!/usr/bin/env python3
"""
Publish test telemetry data to RabbitMQ
"""

import pika
import json
import sys

def publish_test_data():
    try:
        # Connect to RabbitMQ
        credentials = pika.PlainCredentials('invernadero', 'rabbitmq-secure-password-change-me')
        connection = pika.BlockingConnection(
            pika.ConnectionParameters(
                host='localhost',
                port=5672,
                credentials=credentials,
                connection_attempts=3,
                retry_delay=2
            )
        )
        channel = connection.channel()
        
        # Test data - 10 messages with varying temperatures
        test_data = [
            {"temp": 25.5, "humidity": 60, "ts": "2026-05-14T10:00:00Z"},
            {"temp": 26.0, "humidity": 62, "ts": "2026-05-14T10:05:00Z"},
            {"temp": 27.3, "humidity": 64, "ts": "2026-05-14T10:10:00Z"},
            {"temp": 28.5, "humidity": 65, "ts": "2026-05-14T10:15:00Z"},
            {"temp": 29.1, "humidity": 67, "ts": "2026-05-14T10:20:00Z"},
            {"temp": 30.2, "humidity": 68, "ts": "2026-05-14T10:25:00Z"},
            {"temp": 31.5, "humidity": 70, "ts": "2026-05-14T10:30:00Z"},
            {"temp": 32.8, "humidity": 72, "ts": "2026-05-14T10:35:00Z"},
            {"temp": 35.2, "humidity": 71, "ts": "2026-05-14T10:40:00Z"},
            {"temp": 36.5, "humidity": 69, "ts": "2026-05-14T10:45:00Z"},
        ]
        
        print("Publishing test telemetry data to RabbitMQ...")
        print("=" * 60)
        
        # Publish messages
        for i, data in enumerate(test_data, 1):
            message = {
                "sensorId": "S01",
                "greenhouseId": "GW-001",
                "temperature": data["temp"],
                "humidity": data["humidity"],
                "manufacturer": "BOSCH",
                "timestamp": data["ts"]
            }
            
            routing_key = "invernadero.GW-001.S01"
            
            channel.basic_publish(
                exchange='invernadero.telemetry.exchange',
                routing_key=routing_key,
                body=json.dumps(message),
                properties=pika.BasicProperties(content_type='application/json')
            )
            
            print("[{:2d}/10] OK: temp={:5.1f}C  humidity={:2d}%".format(i, data['temp'], data['humidity']))
        
        connection.close()
        
        print("=" * 60)
        print("SUCCESS: All 10 test messages published successfully!")
        print("")
        print("Next steps:")
        print("1. Data should be in alarm.queue and persistence.queue in RabbitMQ")
        print("2. Data should be persisted in mediciones table")
        print("3. API endpoint should return aggregated data")
        print("4. Frontend dashboard should display graphs")
        return 0
        
    except Exception as e:
        print("ERROR: " + str(e), file=sys.stderr)
        return 1

if __name__ == "__main__":
    sys.exit(publish_test_data())
