#!/bin/sh
pm2 env 0 | awk -F= '/^PRIVATE_KEY=/{v=$2; gsub(/\r/,"",v); printf "PM2_PRIVATE_KEY_LEN=%d;STARTS_0X=%d\n", length(v), (v ~ /^0x/)?1:0 }' || true
