package com.sistemas.invernadero.modules.persistence;

import com.sistemas.invernadero.modules.persistence.model.SensorReadingEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SensorReadingRepository extends JpaRepository<SensorReadingEntity, Long> {
    
    @Query("SELECT r FROM SensorReadingEntity r WHERE r.greenhouseId = :greenhouseId AND r.timestamp >= :since ORDER BY r.timestamp DESC")
    List<SensorReadingEntity> findRecentByGreenhouse(@Param("greenhouseId") String greenhouseId, @Param("since") LocalDateTime since);

    @Query("SELECT AVG(r.temperature) FROM SensorReadingEntity r WHERE r.greenhouseId = :greenhouseId AND r.timestamp >= :since")
    Double getAverageTemperature(@Param("greenhouseId") String greenhouseId, @Param("since") LocalDateTime since);
}
