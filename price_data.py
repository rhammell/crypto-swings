''' Get historic crypto price data using the GDAX API '''

import time
import datetime
import json
import gdax

# Initialize output data
output = {'BTC-USD': [],
          'BCH-USD': [],
          'ETH-USD': [],
          'LTC-USD': [] }

# Create gdax client
client = gdax.PublicClient()

# Set complete date range
start = datetime.date(2013, 1, 1)
end = datetime.date.today()

# Chunk date range into 200-day ranges to comply with API limits
date_ranges = []
span  = datetime.timedelta(days=100)
stop = end - span

while start < stop:
    current = start + span
    date_ranges.append((start, current))
    start = current
date_ranges.append((start, end))

# Loop through date ranges
for dates in date_ranges:
    print(dates[0], dates[1])

    # Loop through product id's 
    for product_id in output.keys():
        print(product_id)

        # Make API request
        candles = client.get_product_historic_rates(
                    product_id, 
                    start=dates[0].isoformat(),
                    end=dates[1].isoformat(),
                    granularity=86400)

        # Loop through returned candle data
        candles.reverse()
        for candle in candles: 

            # Add price and date to output
            price = float(candle[4])
            date = datetime.date.fromtimestamp(candle[0]).isoformat()
            output[product_id].append({'date': date, 'price': price})

        # Pause between requests to comply with API limits
        time.sleep(3)

# Save json formatted data
with open('price_data.json', 'w') as f:
    json.dump(output, f)
