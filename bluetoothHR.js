// bluetoothHR.js

const HEART_RATE_SERVICE_UUID = 'heart_rate';
const HEART_RATE_CHARACTERISTIC_UUID = 'heart_rate_measurement';

async function connectHeartRateMonitor() {
  try {
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ services: [HEART_RATE_SERVICE_UUID] }]
    });
    console.log("Connected to device:", device.name);

    const server = await device.gatt.connect();
    const service = await server.getPrimaryService(HEART_RATE_SERVICE_UUID);
    const characteristic = await service.getCharacteristic(HEART_RATE_CHARACTERISTIC_UUID);

    await characteristic.startNotifications();
    characteristic.addEventListener('characteristicvaluechanged', handleHeartRateData);

    console.log("Heart rate monitor connected and notifications started.");
  } catch (error) {
    console.error("Failed to connect to heart rate monitor:", error);
  }
}

function handleHeartRateData(event) {
  const value = event.target.value;
  const flags = value.getUint8(0);
  const heartRate = flags & 0x01 ? value.getUint16(1, true) : value.getUint8(1);

  console.log("Heart Rate:", heartRate);
  document.getElementById("heartRateDisplay").textContent = `Heart Rate: ${heartRate} bpm`;
}

// Optional: Disconnect function
async function disconnectHeartRateMonitor(device) {
  if (device && device.gatt.connected) {
    await device.gatt.disconnect();
    console.log("Device disconnected");
  }
}
function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

if (!isIOS() && 'bluetooth' in navigator) {
  // Show the connect button and heart rate display on supported devices
  document.getElementById("connectHRButton").style.display = "block";
  document.getElementById("heartRateDisplay").style.display = "block";
  document.getElementById("heart-rate-container").style.display = "flex";
} else {
  // Hide the entire heart-rate-container on iOS
  document.getElementById("heart-rate-container").style.display = "none";
  console.warn("Web Bluetooth is not supported on iOS.");
}


// Expose functions to the global scope so they can be accessed from the HTML
window.connectHeartRateMonitor = connectHeartRateMonitor;
window.disconnectHeartRateMonitor = disconnectHeartRateMonitor;
