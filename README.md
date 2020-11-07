# crypto-swings
Crypto Swings is a single-page web interface for displaying historic cryptocurrency prices and exploring their volatility. 

Daily price data for Bitcoin, Bitcoin Cash, Ethereum, and Litecoin can be interactively plotted, and overlayed with annotations marking dates of large changes in price.

Users are prompted to select a currency (BTC, BCH, ETH, LTC), a price swing percent (-50% through +50%), and a time range (1 day, 1 week, 1 month). Dates where the price changed by the selected percentage within the selected time range are highlighted on the price chart, and displayed in a results table.  

See a live demo [here](https://rhammell.github.io/crypto-swings/)

## Historic Price Data

Formatted price data for each cryptocurrency is stored within `prices.json`. Create an updated version of this file with the latest prices by running the `price.py` Python script. This script uses the [Coinbase Pro API](https://docs.pro.coinbase.com/) to obtain daily closing prices for each currency.
```bash
# Go to data dir
cd data

# Install required Python modules
pip3 install -r requirements.txt

# Update price data
python3 prices.py 
```