import wave
import struct
import math
import os

output_path = "android/app/src/main/res/raw/ringtone.wav"

# Ensure directory exists
os.makedirs(os.path.dirname(output_path), exist_ok=True)

SAMPLE_RATE = 44100
freq1 = 800.0
freq2 = 1000.0

# 16-bit PCM, Mono, 44100 Hz (100% Android compatible)
file = wave.open(output_path, "w")
file.setnchannels(1)
file.setsampwidth(2)
file.setframerate(SAMPLE_RATE)

# Create a ringing pattern (0.4s sound, 0.2s pause, 0.4s sound, 1s pause)
def write_tone(freq, duration_sec):
    samples = int(SAMPLE_RATE * duration_sec)
    for i in range(samples):
        value = int(32767.0 * math.sin(2.0 * math.pi * freq * (i / float(SAMPLE_RATE))))
        file.writeframesraw(struct.pack("<h", value))

def write_silence(duration_sec):
    samples = int(SAMPLE_RATE * duration_sec)
    for i in range(samples):
        file.writeframesraw(struct.pack("<h", 0))

# Loop a few times to make it a decent length (Notifee will loop the file itself anyway)
for _ in range(5):
    write_tone(freq1, 0.2)
    write_tone(freq2, 0.2)
    write_silence(0.2)
    write_tone(freq1, 0.2)
    write_tone(freq2, 0.2)
    write_silence(1.5)

file.close()
print("Perfect Android Ringtone created at:", output_path)
