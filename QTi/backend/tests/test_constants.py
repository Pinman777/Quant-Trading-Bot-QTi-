import pytest
from app.constants import (
    API_PREFIX,
    AUTH_PREFIX,
    BOT_PREFIX,
    MARKET_PREFIX,
    SERVER_PREFIX,
    BACKTEST_PREFIX,
    OPTIMIZE_PREFIX,
    Timeframe,
    Exchange,
    BotStatus,
    ServerStatus,
    CACHE_DURATIONS,
    DEFAULT_LIMIT,
    DEFAULT_OFFSET,
    FILE_PATHS,
    MESSAGES,
    ERROR_CODES
)

def test_api_prefixes():
    # Test API prefixes
    assert API_PREFIX == "/api"
    assert AUTH_PREFIX == "/api/auth"
    assert BOT_PREFIX == "/api/bot"
    assert MARKET_PREFIX == "/api/market"
    assert SERVER_PREFIX == "/api/server"
    assert BACKTEST_PREFIX == "/api/backtest"
    assert OPTIMIZE_PREFIX == "/api/optimize"

def test_timeframe_enum():
    # Test Timeframe enum
    assert Timeframe.MINUTE.value == "1m"
    assert Timeframe.FIVE_MINUTES.value == "5m"
    assert Timeframe.FIFTEEN_MINUTES.value == "15m"
    assert Timeframe.THIRTY_MINUTES.value == "30m"
    assert Timeframe.HOUR.value == "1h"
    assert Timeframe.FOUR_HOURS.value == "4h"
    assert Timeframe.DAY.value == "1d"
    assert Timeframe.WEEK.value == "1w"
    assert Timeframe.MONTH.value == "1M"

def test_exchange_enum():
    # Test Exchange enum
    assert Exchange.BINANCE.value == "binance"
    assert Exchange.BYBIT.value == "bybit"
    assert Exchange.OKX.value == "okx"

def test_bot_status_enum():
    # Test BotStatus enum
    assert BotStatus.RUNNING.value == "running"
    assert BotStatus.STOPPED.value == "stopped"
    assert BotStatus.ERROR.value == "error"
    assert BotStatus.PENDING.value == "pending"

def test_server_status_enum():
    # Test ServerStatus enum
    assert ServerStatus.ONLINE.value == "online"
    assert ServerStatus.OFFLINE.value == "offline"
    assert ServerStatus.ERROR.value == "error"

def test_cache_durations():
    # Test cache durations
    assert CACHE_DURATIONS["global_metrics"] == 300
    assert CACHE_DURATIONS["cryptocurrency_list"] == 60
    assert CACHE_DURATIONS["cryptocurrency_details"] == 60
    assert CACHE_DURATIONS["cryptocurrency_chart"] == 60
    assert CACHE_DURATIONS["cryptocurrency_metadata"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_quotes"] == 60
    assert CACHE_DURATIONS["cryptocurrency_market_pairs"] == 300
    assert CACHE_DURATIONS["cryptocurrency_ohlcv"] == 60
    assert CACHE_DURATIONS["cryptocurrency_price"] == 60
    assert CACHE_DURATIONS["cryptocurrency_volume"] == 300
    assert CACHE_DURATIONS["cryptocurrency_market_cap"] == 300
    assert CACHE_DURATIONS["cryptocurrency_supply"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_date"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_date"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_percentage"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_percentage"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_currency"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_currency"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_btc"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_btc"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_eth"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_eth"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_usd"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_usd"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_eur"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_eur"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_gbp"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_gbp"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_jpy"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_jpy"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_cny"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_cny"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_inr"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_inr"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_brl"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_brl"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_rub"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_rub"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_krw"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_krw"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_sgd"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_sgd"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_hkd"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_hkd"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_aud"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_aud"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_cad"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_cad"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_chf"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_chf"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_nzd"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_nzd"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_sek"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_sek"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_nok"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_nok"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_pln"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_pln"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_zar"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_zar"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_try"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_try"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_mxn"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_mxn"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_ils"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_ils"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_myr"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_myr"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_php"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_php"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_thb"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_thb"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_idr"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_idr"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_twd"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_twd"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_huf"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_huf"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_czk"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_czk"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_dkk"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_dkk"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_ron"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_ron"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_bgn"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_bgn"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_hrk"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_hrk"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_isk"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_isk"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_rsd"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_rsd"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_uah"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_uah"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_egp"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_egp"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_clp"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_clp"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_cop"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_cop"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_pen"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_pen"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_ars"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_ars"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_vef"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_vef"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_uyu"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_uyu"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_pyg"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_pyg"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_bob"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_bob"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_crc"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_crc"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_dop"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_dop"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_gtq"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_gtq"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_hnl"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_hnl"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_nio"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_nio"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_pab"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_pab"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_svc"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_svc"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_ttd"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_ttd"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_jmd"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_jmd"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_ang"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_ang"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_awg"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_awg"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_bbd"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_bbd"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_bzd"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_bzd"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_cup"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_cup"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_dop"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_dop"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_htg"] == 3600
    assert CACHE_Durations["cryptocurrency_atl_change_htg"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_jmd"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_jmd"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_kyd"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_kyd"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_lrd"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_lrd"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_nad"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_nad"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_srd"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_srd"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_ttd"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_ttd"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_xcd"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_xcd"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_xpf"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_xpf"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_ath_change_zwl"] == 3600
    assert CACHE_DURATIONS["cryptocurrency_atl_change_zwl"] == 3600

def test_default_limits():
    # Test default limits
    assert DEFAULT_LIMIT == 100
    assert DEFAULT_OFFSET == 0

def test_file_paths():
    # Test file paths
    assert FILE_PATHS["config"] == "config"
    assert FILE_PATHS["cache"] == "cache"
    assert FILE_PATHS["logs"] == "logs"
    assert FILE_PATHS["bot_config"] == "config/bot"
    assert FILE_PATHS["server_config"] == "config/server"

def test_messages():
    # Test messages
    assert MESSAGES["success"] == "Success"
    assert MESSAGES["error"] == "Error"
    assert MESSAGES["not_found"] == "Not found"
    assert MESSAGES["unauthorized"] == "Unauthorized"
    assert MESSAGES["forbidden"] == "Forbidden"
    assert MESSAGES["validation_error"] == "Validation error"
    assert MESSAGES["database_error"] == "Database error"
    assert MESSAGES["api_error"] == "API error"
    assert MESSAGES["bot_error"] == "Bot error"
    assert MESSAGES["server_error"] == "Server error"
    assert MESSAGES["market_error"] == "Market data error"
    assert MESSAGES["config_error"] == "Configuration error"

def test_error_codes():
    # Test error codes
    assert ERROR_CODES["success"] == 200
    assert ERROR_CODES["created"] == 201
    assert ERROR_CODES["no_content"] == 204
    assert ERROR_CODES["bad_request"] == 400
    assert ERROR_CODES["unauthorized"] == 401
    assert ERROR_CODES["forbidden"] == 403
    assert ERROR_CODES["not_found"] == 404
    assert ERROR_CODES["method_not_allowed"] == 405
    assert ERROR_CODES["conflict"] == 409
    assert ERROR_CODES["unprocessable_entity"] == 422
    assert ERROR_CODES["too_many_requests"] == 429
    assert ERROR_CODES["internal_server_error"] == 500
    assert ERROR_CODES["bad_gateway"] == 502
    assert ERROR_CODES["service_unavailable"] == 503
    assert ERROR_CODES["gateway_timeout"] == 504 