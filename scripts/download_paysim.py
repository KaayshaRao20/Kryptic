import os
import sys
import urllib.request
import time

PAYSIM_URL = "https://huggingface.co/datasets/vitaliy-sharandin/synthetic-fraud-detection/resolve/main/PS_20174392719_1491204439457_log.csv"
OUTPUT_DIR = os.path.join("datasets", "raw", "dataset_1_paysim")
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "paysim_transactions.csv")

def download_paysim():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"Connecting to {PAYSIM_URL}...")
    
    headers = {"User-Agent": "Mozilla/5.0"}
    req = urllib.request.Request(PAYSIM_URL, headers=headers)
    
    start_time = time.time()
    fraud_count = 0
    total_lines = 0
    max_lines = 300000  # 300k authentic transactions
    
    with urllib.request.urlopen(req) as response, open(OUTPUT_FILE, "w", encoding="utf-8") as out:
        header = response.readline().decode("utf-8")
        out.write(header)
        
        while total_lines < max_lines:
            line_bytes = response.readline()
            if not line_bytes:
                break
            line = line_bytes.decode("utf-8")
            out.write(line)
            total_lines += 1
            
            # Count fraud events in stream
            parts = line.strip().split(",")
            if len(parts) >= 10 and parts[9] == "1":
                fraud_count += 1
                
            if total_lines % 50000 == 0:
                elapsed = round(time.time() - start_time, 1)
                print(f"Downloaded {total_lines:,} rows | Frauds captured: {fraud_count:,} | Elapsed: {elapsed}s")
                
    elapsed = round(time.time() - start_time, 1)
    file_size_mb = round(os.path.getsize(OUTPUT_FILE) / (1024 * 1024), 2)
    print(f"\nDownload completed in {elapsed}s!")
    print(f"File: {OUTPUT_FILE} ({file_size_mb} MB)")
    print(f"Total Rows: {total_lines:,} | Fraud Rows: {fraud_count:,}")

if __name__ == "__main__":
    download_paysim()
