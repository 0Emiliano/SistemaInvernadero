package com.sistemas.invernadero.config;

import org.springframework.amqp.core.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {

    public static final String EXCHANGE_NAME = "invernadero.telemetry.exchange";
    public static final String ALARM_QUEUE = "alarm.service.queue";
    public static final String PERSISTENCE_QUEUE = "persistence.service.queue";
    public static final String ROUTING_PATTERN = "invernadero.#";

    @Bean
    public org.springframework.amqp.support.converter.MessageConverter jsonMessageConverter() {
        return new org.springframework.amqp.support.converter.Jackson2JsonMessageConverter();
    }

    @Bean
    public TopicExchange telemetryExchange() {
        return new TopicExchange(EXCHANGE_NAME);
    }

    @Bean
    public Queue alarmQueue() {
        return new Queue(ALARM_QUEUE);
    }

    @Bean
    public Queue persistenceQueue() {
        return new Queue(PERSISTENCE_QUEUE);
    }

    @Bean
    public Binding bindAlarm(Queue alarmQueue, TopicExchange telemetryExchange) {
        return BindingBuilder.bind(alarmQueue).to(telemetryExchange).with(ROUTING_PATTERN);
    }

    @Bean
    public Binding bindPersistence(Queue persistenceQueue, TopicExchange telemetryExchange) {
        return BindingBuilder.bind(persistenceQueue).to(telemetryExchange).with(ROUTING_PATTERN);
    }
}
