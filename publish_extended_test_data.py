#!/usr/bin/env python3
"""
Extended test telemetry - multi-greenhouse, multi-sensor
"""

import pika
import json
import sys

def publish_extended_test_data():
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
        
        # Extended test data: Multi-greenhouse, multi-sensor scenario
        test_scenarios = [
            # Greenhouse 1 - Sensor 1 (10 readings)
            {
                "greenhouse": "GW-001",
                "sensor": "S01",
                "readings": [
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
            },
            # Greenhouse 1 - Sensor 2 (10 readings)
            {
                "greenhouse": "GW-001",
                "sensor": "S02",
                "readings": [
                    {"temp": 22.0, "humidity": 55, "ts": "2026-05-14T10:00:00Z"},
                    {"temp": 22.5, "humidity": 56, "ts": "2026-05-14T10:05:00Z"},
                    {"temp": 23.1, "humidity": 57, "ts": "2026-05-14T10:10:00Z"},
                    {"temp": 24.2, "humidity": 59, "ts": "2026-05-14T10:15:00Z"},
                    {"temp": 25.0, "humidity": 61, "ts": "2026-05-14T10:20:00Z"},
                    {"temp": 26.3, "humidity": 63, "ts": "2026-05-14T10:25:00Z"},
                    {"temp": 27.8, "humidity": 65, "ts": "2026-05-14T10:30:00Z"},
                    {"temp": 28.5, "humidity": 66, "ts": "2026-05-14T10:35:00Z"},
                    {"temp": 29.2, "humidity": 68, "ts": "2026-05-14T10:40:00Z"},
                    {"temp": 30.1, "humidity": 69, "ts": "2026-05-14T10:45:00Z"},
                ]
            },
            # Greenhouse 2 - Sensor 1 (5 readings)
            {
                "greenhouse": "GW-002",
                "sensor": "S01",
                "readings": [
                    {"temp": 18.5, "humidity": 50, "ts": "2026-05-14T10:00:00Z"},
                    {"temp": 19.2, "humidity": 52, "ts": "2026-05-14T10:10:00Z"},
                    {"temp": 20.1, "humidity": 54, "ts": "2026-05-14T10:20:00Z"},
                    {"temp": 21.3, "humidity": 56, "ts": "2026-05-14T10:30:00Z"},
                    {"temp": 22.5, "humidity": 58, "ts": "2026-05-14T10:40:00Z"},
                ]
            },
        ]
        
        total_count = 0
        print("Publishing extended test data (multi-greenhouse, multi-sensor)...")
        print("=" * 70)
        
        for scenario in test_scenarios:
            greenhouse = scenario["greenhouse"]
            sensor = scenario["sensor"]
            readings = scenario["readings"]
            
            print(f"\nGreenhouse {greenhouse} - Sensor {sensor}: {len(readings)} readings")
            print("-" * 70)
            
            for reading in readings:
                message = {
                    "sensorId": sensor,
                    "greenhouseId": greenhouse,
                    "temperature": reading["temp"],
                    "humidity": reading["humidity"],
                    "manufacturer": "BOSCH",
                    "timestamp": reading["ts"]
                }
                
                routing_key = f"invernadero.{greenhouse}.{sensor}"
                
                channel.basic_publish(
                    exchange='invernadero.telemetry.exchange',
                    routing_key=routing_key,
                    body=json.dumps(message),
                    properties=pika.BasicProperties(content_type='application/json')
                )
                
                total_count += 1
                print(f"  [{total_count:2d}] {greenhouse}/{sensor}: temp={reading['temp']:5.1f}C humidity={reading['humidity']:2d}%")
        
        connection.close()
        
        print("\n" + "=" * 70)
        print(f"SUCCESS: Published {total_count} messages total")
        print("\nData breakdown:")
        print(f"  - GW-001/S01: 10 readings (temp range 25.5-36.5C)")
        print(f"  - GW-001/S02: 10 readings (temp range 22.0-30.1C)")
        print(f"  - GW-002/S01: 5 readings (temp range 18.5-22.5C)")
        print("\nTest the following endpoints:")
        print("  - http://localhost:8080/api/v1/analytics/dashboard/GW-001")
        print("  - http://localhost:8080/api/v1/analytics/dashboard/GW-002")
        print("\nExpected results:")
        print("  - GW-001: average temp ~29.0C (combined from 2 sensors)")
        print("  - GW-002: average temp ~20.5C (from 1 sensor)")
        return 0
        
    except Exception as e:
        print("ERROR: " + str(e), file=sys.stderr)
        return 1

if __name__ == "__main__":
    sys.exit(publish_extended_test_data())
