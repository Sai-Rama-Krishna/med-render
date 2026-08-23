import math
import struct
import wave
import os

def generate_beep(frequency=1000, duration_ms=200, sample_rate=44100, amplitude=32767):
    samples = []
    num_samples = int(sample_rate * (duration_ms / 1000.0))
    for i in range(num_samples):
        # Sine wave
        value = math.sin(2 * math.pi * frequency * (i / sample_rate))
        # Envelope to avoid popping (linear fade in/out for 10ms)
        fade_samples = int(sample_rate * 0.01)
        envelope = 1.0
        if i < fade_samples:
            envelope = i / fade_samples
        elif i > num_samples - fade_samples:
            envelope = (num_samples - i) / fade_samples
            
        sample = int(value * amplitude * envelope)
        samples.append(sample)
    return samples

def generate_silence(duration_ms=800, sample_rate=44100):
    num_samples = int(sample_rate * (duration_ms / 1000.0))
    return [0] * num_samples

def synthesize_alarm(output_path):
    sample_rate = 44100
    total_duration_sec = 10
    
    # We will loop: beep (200ms) + silence (800ms) = 1 sec loop
    audio_data = []
    
    for sec in range(total_duration_sec):
        # Fade in scaling from 0.1 to 1.0 over the 10 seconds
        scale = 0.1 + (sec / (total_duration_sec - 1)) * 0.9
        amp = int(32767 * scale)
        
        # Dual tone beep for alarm feel
        beep1 = generate_beep(frequency=880, duration_ms=100, amplitude=amp)
        silence1 = generate_silence(duration_ms=50)
        beep2 = generate_beep(frequency=1046, duration_ms=150, amplitude=amp)
        silence2 = generate_silence(duration_ms=700)
        
        audio_data.extend(beep1)
        audio_data.extend(silence1)
        audio_data.extend(beep2)
        audio_data.extend(silence2)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with wave.open(output_path, 'w') as wav_file:
        wav_file.setnchannels(1) # Mono
        wav_file.setsampwidth(2) # 16-bit
        wav_file.setframerate(sample_rate)
        
        for sample in audio_data:
            # pack as 16-bit little endian
            wav_file.writeframesraw(struct.pack('<h', sample))

if __name__ == "__main__":
    synthesize_alarm('assets/alarm.wav')
    print("Generated assets/alarm.wav successfully!")
