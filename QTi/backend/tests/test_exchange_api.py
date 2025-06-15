import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, Mock
from datetime import datetime
from main import app
from core.exchanges.base import (
    MarketInfo,
    OrderBook,
    Trade,
    Order,
    Position,
    Balance
)

client = TestClient(app)

@pytest.fixture
def mock_exchange_service():
    with patch('api.exchanges.exchange_service') as mock:
        mock.get_supported_exchanges.return_value = [
            {
                'name': 'binance',
                'supported_markets': ['spot', 'futures'],
                'has_testnet': True,
                'max_leverage': 125,
                'min_order_size': 0.0001,
                'trading_fees': {
                    'maker': 0.001,
                    'taker': 0.001
                },
                'supported_timeframes': ['1m', '5m', '15m', '1h', '4h', '1d'],
                'supported_order_types': ['limit', 'market', 'stop', 'stop_limit']
            }
        ]
        mock.get_exchange_status.return_value = {
            'is_connected': True,
            'last_update': datetime.now().timestamp()
        }
        mock.get_exchange_config.return_value = {
            'name': 'binance',
            'api_key': 'test_key',
            'api_secret': 'test_secret',
            'testnet': False,
            'markets': ['spot', 'futures']
        }
        mock.get_markets.return_value = [
            MarketInfo(
                symbol='BTC/USDT',
                base_asset='BTC',
                quote_asset='USDT',
                min_price=0.01,
                max_price=1000000,
                min_qty=0.0001,
                max_qty=1000,
                min_notional=10,
                price_precision=2,
                qty_precision=4
            )
        ]
        mock.get_order_book.return_value = OrderBook(
            symbol='BTC/USDT',
            bids=[[50000, 1.0], [49900, 2.0]],
            asks=[[50100, 1.0], [50200, 2.0]],
            timestamp=datetime.now().timestamp()
        )
        mock.get_trades.return_value = [
            Trade(
                id='1',
                symbol='BTC/USDT',
                side='buy',
                price=50000,
                qty=1.0,
                timestamp=datetime.now().timestamp()
            )
        ]
        mock.create_order.return_value = Order(
            id='1',
            symbol='BTC/USDT',
            market_type='spot',
            side='buy',
            type='limit',
            price=50000,
            qty=1.0,
            filled_qty=0.0,
            status='new',
            timestamp=datetime.now().timestamp()
        )
        mock.cancel_order.return_value = Order(
            id='1',
            symbol='BTC/USDT',
            market_type='spot',
            side='buy',
            type='limit',
            price=50000,
            qty=1.0,
            filled_qty=0.0,
            status='canceled',
            timestamp=datetime.now().timestamp()
        )
        mock.get_open_orders.return_value = [
            Order(
                id='1',
                symbol='BTC/USDT',
                market_type='spot',
                side='buy',
                type='limit',
                price=50000,
                qty=1.0,
                filled_qty=0.0,
                status='new',
                timestamp=datetime.now().timestamp()
            )
        ]
        mock.get_order_history.return_value = [
            Order(
                id='1',
                symbol='BTC/USDT',
                market_type='spot',
                side='buy',
                type='limit',
                price=50000,
                qty=1.0,
                filled_qty=1.0,
                status='filled',
                timestamp=datetime.now().timestamp()
            )
        ]
        mock.get_positions.return_value = [
            Position(
                symbol='BTC/USDT',
                side='long',
                entry_price=50000,
                mark_price=51000,
                qty=1.0,
                leverage=10,
                margin_type='isolated',
                liquidation_price=45000,
                unrealized_pnl=1000,
                realized_pnl=0
            )
        ]
        mock.get_balance.return_value = [
            Balance(
                asset='BTC',
                free=1.0,
                locked=0.0
            )
        ]
        mock.test_connection.return_value = {
            'is_connected': True,
            'last_update': datetime.now().timestamp()
        }
        yield mock

def test_get_supported_exchanges(mock_exchange_service):
    """Test getting supported exchanges"""
    response = client.get('/api/exchanges/supported')
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]['name'] == 'binance'

def test_get_exchange_status(mock_exchange_service):
    """Test getting exchange status"""
    response = client.get('/api/exchanges/binance/status')
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert data['is_connected'] is True

def test_get_exchange_config(mock_exchange_service):
    """Test getting exchange configuration"""
    response = client.get('/api/exchanges/binance/config')
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert data['name'] == 'binance'
    assert data['api_key'] == 'test_key'
    assert data['api_secret'] == 'test_secret'
    assert data['testnet'] is False

def test_update_exchange_config(mock_exchange_service):
    """Test updating exchange configuration"""
    config = {
        'api_key': 'new_key',
        'api_secret': 'new_secret',
        'testnet': True
    }
    response = client.post('/api/exchanges/binance/config', json=config)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert data['name'] == 'binance'
    assert data['api_key'] == 'new_key'
    assert data['api_secret'] == 'new_secret'
    assert data['testnet'] is True

def test_get_markets(mock_exchange_service):
    """Test getting markets"""
    response = client.get('/api/exchanges/binance/markets/spot')
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]['symbol'] == 'BTC/USDT'

def test_get_order_book(mock_exchange_service):
    """Test getting order book"""
    response = client.get('/api/exchanges/binance/orderbook/BTC/USDT/spot')
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert data['symbol'] == 'BTC/USDT'
    assert len(data['bids']) == 2
    assert len(data['asks']) == 2

def test_get_trades(mock_exchange_service):
    """Test getting trades"""
    response = client.get('/api/exchanges/binance/trades/BTC/USDT/spot')
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]['symbol'] == 'BTC/USDT'

def test_create_order(mock_exchange_service):
    """Test creating order"""
    order = {
        'symbol': 'BTC/USDT',
        'market_type': 'spot',
        'side': 'buy',
        'type': 'limit',
        'quantity': 1.0,
        'price': 50000
    }
    response = client.post('/api/exchanges/binance/orders', json=order)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert data['symbol'] == 'BTC/USDT'
    assert data['side'] == 'buy'
    assert data['type'] == 'limit'

def test_cancel_order(mock_exchange_service):
    """Test canceling order"""
    response = client.delete('/api/exchanges/binance/orders/BTC/USDT/spot/1')
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert data['symbol'] == 'BTC/USDT'
    assert data['status'] == 'canceled'

def test_get_open_orders(mock_exchange_service):
    """Test getting open orders"""
    response = client.get('/api/exchanges/binance/orders')
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]['status'] == 'new'

def test_get_order_history(mock_exchange_service):
    """Test getting order history"""
    response = client.get('/api/exchanges/binance/orders/history')
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]['status'] == 'filled'

def test_get_positions(mock_exchange_service):
    """Test getting positions"""
    response = client.get('/api/exchanges/binance/positions')
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]['symbol'] == 'BTC/USDT'

def test_get_balance(mock_exchange_service):
    """Test getting balance"""
    response = client.get('/api/exchanges/binance/balance')
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]['asset'] == 'BTC'

def test_test_connection(mock_exchange_service):
    """Test testing connection"""
    config = {
        'api_key': 'test_key',
        'api_secret': 'test_secret',
        'testnet': False
    }
    response = client.post('/api/exchanges/binance/test', json=config)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert data['is_connected'] is True 