# Etapa 1: Build con Maven
FROM maven:3.9.6-eclipse-temurin-17
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn package -DskipTests

# Etapa 2: Runtime ligero
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Configuración de rendimiento de la JVM
ENV JAVA_OPTS="-Xms256m -Xmx512m"

EXPOSE 3000
EXPOSE 9000

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
