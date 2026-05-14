#!/bin/bash

# Send test telemetry via RabbitMQ
# This script publishes messages to the invernadero.telemetry.exchange

POD_NAME="rabbitmq-5b8bf687c9-j2fts"
NAMESPACE="invernadero"
EXCHANGE="invernadero.telemetry.exchange"
ROUTING_KEY="invernadero.GW-001.S01"

# Function to send a message
send_message() {
  local temp=$1
  local humidity=$2
  local timestamp=$3
  
  kubectl exec -i "$POD_NAME" -n "$NAMESPACE" -- sh << EOF
(
  sleep 1
  echo '{"sensorId":"S01","greenhouseId":"GW-001","temperature":'$temp',"humidity":'$humidity',"manufacturer":"BOSCH","timestamp":"'$timestamp'"}'
  sleep 1
) | rabbitmqctl eval 'amqp_channel:call(Channel, #"basic.publish"{exchange = <<"'$EXCHANGE'">>, routing_key = <<"'$ROUTING_KEY'">>}, #amqp_msg{payload = Input}).' 2>/dev/null || echo "Message sent: temp=$temp humidity=$humidity"
EOF
}

echo "Sending test telemetry to RabbitMQ..."
echo "Exchange: $EXCHANGE"
echo "Routing Key: $ROUTING_KEY"
echo ""

# Send multiple test messages with different temperatures
TIMESTAMPS=(
  "2026-05-14T10:00:00"
  "2026-05-14T10:05:00"
  "2026-05-14T10:10:00"
  "2026-05-14T10:15:00"
  "2026-05-14T10:20:00"
  "2026-05-14T10:25:00"
  "2026-05-14T10:30:00"
  "2026-05-14T10:35:00"
  "2026-05-14T10:40:00"
  "2026-05-14T10:45:00"
)

TEMPERATURES=(25.5 26.0 27.3 28.5 29.1 30.2 31.5 32.8 35.2 36.5)
HUMIDITIES=(60 62 64 65 67 68 70 72 71 69)

for i in "${!TEMPERATURES[@]}"; do
  temp=${TEMPERATURES[$i]}
  humidity=${HUMIDITIES[$i]}
  timestamp=${TIMESTAMPS[$i]}
  
  echo "[$((i+1))/10] Sending: temp=$temp humidity=$humidity timestamp=$timestamp"
  send_message "$temp" "$humidity" "$timestamp"
  sleep 1
done

echo ""
echo "✅ Test data sent successfully!"
echo ""
echo "Next steps:"
echo "1. Check database: kubectl exec -it pod/timescaledb-6df8496b78-rskkm -n invernadero -- psql -U admin -d invernadero_db -c 'SELECT * FROM mediciones;'"
echo "2. Check API: http://localhost:8080/api/v1/analytics/dashboard/GW-001"
echo "3. Check Frontend: http://localhost:3000"
