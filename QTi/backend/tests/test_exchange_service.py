import pytest
from datetime import datetime
from unittest.mock import Mock, patch
from services.exchange_service import ExchangeService
from core.exchanges.base import (
    MarketInfo,
    OrderBook,
    Trade,
    Order,
    Position,
    Balance
)

@pytest.fixture
def exchange_service():
    return ExchangeService()

@pytest.fixture
def mock_exchange():
    exchange = Mock()
    exchange.api_key = 'test_key'
    exchange.api_secret = 'test_secret'
    exchange.testnet = False
    exchange.initialize = Mock(return_value=None)
    exchange.close = Mock(return_value=None)
    exchange.test_connection = Mock(return_value=True)
    exchange.get_markets = Mock(return_value=[
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
    ])
    exchange.get_order_book = Mock(return_value=OrderBook(
        symbol='BTC/USDT',
        bids=[[50000, 1.0], [49900, 2.0]],
        asks=[[50100, 1.0], [50200, 2.0]],
        timestamp=datetime.now().timestamp()
    ))
    exchange.get_trades = Mock(return_value=[
        Trade(
            id='1',
            symbol='BTC/USDT',
            side='buy',
            price=50000,
            qty=1.0,
            timestamp=datetime.now().timestamp()
        )
    ])
    exchange.create_order = Mock(return_value=Order(
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
    ))
    exchange.cancel_order = Mock(return_value=Order(
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
    ))
    exchange.get_open_orders = Mock(return_value=[
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
    ])
    exchange.get_order_history = Mock(return_value=[
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
    ])
    exchange.get_positions = Mock(return_value=[
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
    ])
    exchange.get_balance = Mock(return_value=[
        Balance(
            asset='BTC',
            free=1.0,
            locked=0.0
        )
    ])
    return exchange

@pytest.mark.asyncio
async def test_get_supported_exchanges(exchange_service):
    """Test getting supported exchanges"""
    exchanges = await exchange_service.get_supported_exchanges()
    assert isinstance(exchanges, list)
    assert len(exchanges) > 0
    assert all(isinstance(exchange, dict) for exchange in exchanges)

@pytest.mark.asyncio
async def test_get_exchange_status(exchange_service, mock_exchange):
    """Test getting exchange status"""
    exchange_service._exchanges['binance'] = mock_exchange
    status = await exchange_service.get_exchange_status('binance')
    assert isinstance(status, dict)
    assert 'is_connected' in status
    assert 'last_update' in status
    assert status['is_connected'] is True

@pytest.mark.asyncio
async def test_get_exchange_config(exchange_service, mock_exchange):
    """Test getting exchange configuration"""
    exchange_service._exchanges['binance'] = mock_exchange
    config = await exchange_service.get_exchange_config('binance')
    assert isinstance(config, dict)
    assert config['name'] == 'binance'
    assert config['api_key'] == 'test_key'
    assert config['api_secret'] == 'test_secret'
    assert config['testnet'] is False

@pytest.mark.asyncio
async def test_update_exchange_config(exchange_service):
    """Test updating exchange configuration"""
    config = {
        'api_key': 'new_key',
        'api_secret': 'new_secret',
        'testnet': True
    }
    with patch('core.exchanges.factory.ExchangeFactory.create') as mock_create:
        mock_create.return_value = Mock()
        mock_create.return_value.initialize = Mock(return_value=None)
        mock_create.return_value.api_key = 'new_key'
        mock_create.return_value.api_secret = 'new_secret'
        mock_create.return_value.testnet = True

        updated_config = await exchange_service.update_exchange_config('binance', config)
        assert isinstance(updated_config, dict)
        assert updated_config['name'] == 'binance'
        assert updated_config['api_key'] == 'new_key'
        assert updated_config['api_secret'] == 'new_secret'
        assert updated_config['testnet'] is True

@pytest.mark.asyncio
async def test_get_markets(exchange_service, mock_exchange):
    """Test getting markets"""
    exchange_service._exchanges['binance'] = mock_exchange
    markets = await exchange_service.get_markets('binance', 'spot')
    assert isinstance(markets, list)
    assert len(markets) == 1
    assert isinstance(markets[0], MarketInfo)
    assert markets[0].symbol == 'BTC/USDT'

@pytest.mark.asyncio
async def test_get_order_book(exchange_service, mock_exchange):
    """Test getting order book"""
    exchange_service._exchanges['binance'] = mock_exchange
    order_book = await exchange_service.get_order_book('binance', 'BTC/USDT', 'spot')
    assert isinstance(order_book, OrderBook)
    assert order_book.symbol == 'BTC/USDT'
    assert len(order_book.bids) == 2
    assert len(order_book.asks) == 2

@pytest.mark.asyncio
async def test_get_trades(exchange_service, mock_exchange):
    """Test getting trades"""
    exchange_service._exchanges['binance'] = mock_exchange
    trades = await exchange_service.get_trades('binance', 'BTC/USDT', 'spot')
    assert isinstance(trades, list)
    assert len(trades) == 1
    assert isinstance(trades[0], Trade)
    assert trades[0].symbol == 'BTC/USDT'

@pytest.mark.asyncio
async def test_create_order(exchange_service, mock_exchange):
    """Test creating order"""
    exchange_service._exchanges['binance'] = mock_exchange
    order = await exchange_service.create_order('binance', {
        'symbol': 'BTC/USDT',
        'market_type': 'spot',
        'side': 'buy',
        'type': 'limit',
        'quantity': 1.0,
        'price': 50000
    })
    assert isinstance(order, Order)
    assert order.symbol == 'BTC/USDT'
    assert order.side == 'buy'
    assert order.type == 'limit'

@pytest.mark.asyncio
async def test_cancel_order(exchange_service, mock_exchange):
    """Test canceling order"""
    exchange_service._exchanges['binance'] = mock_exchange
    order = await exchange_service.cancel_order('binance', 'BTC/USDT', 'spot', '1')
    assert isinstance(order, Order)
    assert order.symbol == 'BTC/USDT'
    assert order.status == 'canceled'

@pytest.mark.asyncio
async def test_get_open_orders(exchange_service, mock_exchange):
    """Test getting open orders"""
    exchange_service._exchanges['binance'] = mock_exchange
    orders = await exchange_service.get_open_orders('binance')
    assert isinstance(orders, list)
    assert len(orders) == 1
    assert isinstance(orders[0], Order)
    assert orders[0].status == 'new'

@pytest.mark.asyncio
async def test_get_order_history(exchange_service, mock_exchange):
    """Test getting order history"""
    exchange_service._exchanges['binance'] = mock_exchange
    orders = await exchange_service.get_order_history('binance')
    assert isinstance(orders, list)
    assert len(orders) == 1
    assert isinstance(orders[0], Order)
    assert orders[0].status == 'filled'

@pytest.mark.asyncio
async def test_get_positions(exchange_service, mock_exchange):
    """Test getting positions"""
    exchange_service._exchanges['binance'] = mock_exchange
    positions = await exchange_service.get_positions('binance')
    assert isinstance(positions, list)
    assert len(positions) == 1
    assert isinstance(positions[0], Position)
    assert positions[0].symbol == 'BTC/USDT'

@pytest.mark.asyncio
async def test_get_balance(exchange_service, mock_exchange):
    """Test getting balance"""
    exchange_service._exchanges['binance'] = mock_exchange
    balances = await exchange_service.get_balance('binance')
    assert isinstance(balances, list)
    assert len(balances) == 1
    assert isinstance(balances[0], Balance)
    assert balances[0].asset == 'BTC'

@pytest.mark.asyncio
async def test_test_connection(exchange_service):
    """Test testing connection"""
    with patch('core.exchanges.factory.ExchangeFactory.create') as mock_create:
        mock_exchange = Mock()
        mock_exchange.initialize = Mock(return_value=None)
        mock_exchange.close = Mock(return_value=None)
        mock_exchange.test_connection = Mock(return_value=True)
        mock_create.return_value = mock_exchange

        result = await exchange_service.test_connection('binance', {
            'api_key': 'test_key',
            'api_secret': 'test_secret',
            'testnet': False
        })
        assert isinstance(result, dict)
        assert result['is_connected'] is True

@pytest.mark.asyncio
async def test_close(exchange_service, mock_exchange):
    """Test closing all connections"""
    exchange_service._exchanges['binance'] = mock_exchange
    await exchange_service.close()
    assert len(exchange_service._exchanges) == 0 