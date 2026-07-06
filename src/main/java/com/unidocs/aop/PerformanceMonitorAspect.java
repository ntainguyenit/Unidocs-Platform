package com.unidocs.aop;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class PerformanceMonitorAspect {
    private static final Logger logger = LoggerFactory.getLogger(PerformanceMonitorAspect.class);

    @Around("@annotation(com.unidocs.annotation.LogExecutionTime)")
    public Object logExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();
        Object proceed = joinPoint.proceed();
        long executionTime = System.currentTimeMillis() - start;
        logger.info(joinPoint.getSignature() + " executed in " + executionTime + "ms");
        if (executionTime > 2000) {
            logger.warn("PERFORMANCE WARNING: " + joinPoint.getSignature() + " took " + executionTime + "ms (Over 2 seconds!)");
        }
        return proceed;
    }
}
