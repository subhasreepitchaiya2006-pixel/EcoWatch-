/**
 * ====================================================
 * Environmental Intelligence Computation Engine
 * (CO3 Syllabus Demonstration: Hoisting, Static & Instance Methods, Control Flow)
 * ====================================================
 */

// 1. Demonstration of JavaScript Function Hoisting:
// Hoisted function declaration can be invoked before its definition in the code.
export const initialHealthCheck = verifySensorHealth();

export function verifySensorHealth() {
  return { status: "ONLINE", timestamp: new Date().toISOString() };
}

// 2. ES6 Class with Static and Instance Methods (CO3 Requirement):
export class EnvironmentalSensorStation {
  // Instance Constructor
  constructor(stationId, location, baseAltitudeMeters = 15) {
    this.stationId = stationId;
    this.location = location;
    this.baseAltitudeMeters = baseAltitudeMeters;
    this.readingsHistory = []; // Array of Objects
  }

  // --- Static Method (Called on the Class itself, without instantiating) ---
  /**
   * Evaluates overall risk level using weighted control statements
   * @param {number} aqi 
   * @param {number} temperature 
   * @param {number} windSpeed 
   */
  static assessEnvironmentalRisk(aqi, temperature, windSpeed) {
    // Control Statement 1: Extreme Crisis threshold check
    if (aqi >= 200 || (temperature >= 42 && windSpeed >= 35)) {
      return { level: "CRITICAL", alertColor: "#dc2626", action: "Immediate Emergency Incident Mobilization" };
    } 
    // Control Statement 2: High threshold check
    else if (aqi >= 150 || temperature >= 38) {
      return { level: "HIGH", alertColor: "#ea580c", action: "Public Health Warning Issued" };
    } 
    // Control Statement 3: Moderate threshold check
    else if (aqi >= 100 || windSpeed >= 25) {
      return { level: "MODERATE", alertColor: "#d97706", action: "Sensitive Groups Take Precaution" };
    } 
    // Default fallback
    else {
      return { level: "LOW", alertColor: "#16a34a", action: "Nominal Atmospheric Stability" };
    }
  }

  /**
   * Static formula for Heat Index calculation
   */
  static computeHeatIndex(tempC, relativeHumidity) {
    // Simplified Rothfusz regression
    return Number((tempC + 0.33 * (relativeHumidity / 100 * 6.105 * Math.exp(17.27 * tempC / (237.7 + tempC))) - 4).toFixed(1));
  }

  // --- Instance Method (Called on a specific instance of the Class) ---
  /**
   * Logs a new telemetry observation into this instance's history
   */
  recordObservation(temperature, aqi, humidity, windSpeed) {
    // Objects and Arrays manipulation
    const riskAssessment = EnvironmentalSensorStation.assessEnvironmentalRisk(aqi, temperature, windSpeed);
    const observation = {
      id: `OBS-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      stationId: this.stationId,
      metrics: { temperature, aqi, humidity, windSpeed },
      risk: riskAssessment,
    };

    this.readingsHistory.push(observation);
    return observation;
  }

  /**
   * Instance Method: computes aggregated station statistics
   */
  getAverageReadings() {
    if (this.readingsHistory.length === 0) return null;

    // Array.prototype.reduce (Objects & Arrays manipulation)
    const total = this.readingsHistory.reduce(
      (acc, curr) => ({
        temp: acc.temp + curr.metrics.temperature,
        aqi: acc.aqi + curr.metrics.aqi,
      }),
      { temp: 0, aqi: 0 }
    );

    const count = this.readingsHistory.length;
    return {
      averageTemperature: Number((total.temp / count).toFixed(2)),
      averageAqi: Number((total.aqi / count).toFixed(1)),
      totalObservations: count,
    };
  }
}

export default EnvironmentalSensorStation;
