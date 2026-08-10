# Data Safety — robocza deklaracja do Konsoli Play

## Konto uzytkownika
- Aplikacja nie umozliwia tworzenia konta: TAK.
- Nie jest potrzebny link do usuwania konta, bo konto aplikacji nie istnieje.

## Dane gry
- Uklad statkow, trafienia i wiadomosci protokolu gry sa przesy lane w kanalach WebRTC.
- Tresc kanalu WebRTC jest szyfrowana pomiedzy uczestnikami.

## Dane techniczne sieci
Poza urzadzenie sa przekazywane dane niezbedne do zestawienia polaczenia, m.in. adres IP, identyfikator peer/sesji oraz dane ICE/SDP. Sa obslugiwane przez infrastrukture PeerJS/Render, STUN oraz TURN.

## Reklamy / analityka
- Brak AdMob.
- Brak Advertising ID.
- Brak Firebase Analytics / Google Analytics w aplikacji.
- Brak SDK reklamowego.

## Uprawnienia Android
- INTERNET
- ACCESS_NETWORK_STATE

Brak lokalizacji, aparatu, mikrofonu, kontaktow i pamieci uzytkownika.

## Szyfrowanie
Dane sieciowe korzystaja z HTTPS/TLS oraz szyfrowanych kanalow WebRTC.
