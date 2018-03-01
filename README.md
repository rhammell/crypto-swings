# crypto-swings
Crypto Swings is a single-page web interface for displaying historic cryptocurrency prices and exploring their volatility. Daily price data for Bitcoin, Bitcoin Cash, Ethereum, and Litecoin can be interactively plotted, and overlayed with annotations marking dates of large changes in price.

Users are prompted to select a currency (BTC, BCH, ETH, LTC), a price swing percent (-50% through +50%), and a time range (1 day, 1 week, 1 month). Dates where the price changed by the selected percentage within the selected time range are highlighted on the price chart, and displayed in table.  

See a live demo [here](https://rhammell.github.io/crypto-swings/)

## Setup
```bash
# Clone this repository
git clone https://github.com/rhammell/crypto-swings.git

# Go into the repository
cd crypto-swings

# Install required modules
pip install -r requirements.txt
```

## Historic Price Data

Formatted price data for each cryptocurrency is stored within `price_data.json`. Create an updated version of this file with the latest prices by running the Python script `price_data.py`. This script uses the [GDAX API](https://docs.gdax.com/) to obtain daily closing prices for each currency.
```bash
# Update price data
python price_data.py 
```


