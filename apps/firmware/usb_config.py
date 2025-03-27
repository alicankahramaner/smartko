Import("env")
board_config = env.BoardConfig()

# USB PID ve VID değerlerini güncelleme
board_config.update("build.hwids", [
  ["0x27B8", "0x01ED"]  # Örnek değerler, kendi ihtiyaçlarınıza göre değiştirin
])

# USB ürün ve üretici adlarını güncelleme
board_config.update("build.usb_product", "SmartKo - V1")
board_config.update("build.usb_manufacturer", "SmartKo")
