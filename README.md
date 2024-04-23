# Green Mountain Grills - Vue App

This is a work in progress to redesign an older [open source implementation](https://github.com/Aenima4six2/gmg) of a web app for detecting and controlling a Green Mountain Grill smoker on a local wifi network.

### Why?
----
In my experience, the GMG mobile app is not terribly reliable for indicating when specific events happen. This app mostly serves as a proof of concept and a fun thing to tinker with to help understand how interacting with the grill works. I'm also enjoying practicing some modern JavaScript.

### Features
----
1. Grill Controls (power control, temperature control, food temperature control)
2. Grill status updates pushed every 2s
3. IndexedDB for storing historical data
4. Chart integration for showing grill and food temperature over time
5. Auto connect / grill discovery



### Acknowledgements
Big thanks to [Aenima4six2](https://github.com/Aenima4six2) for all of the work in decoding the protocol of the GMG UDP interface, the [GMG Emulator](https://github.com/Aenima4six2/gmg/tree/master/src/gmg-emulator) and their [GMG Client](https://github.com/Aenima4six2/gmg/tree/master/src/gmg-client) library. Their prior work as a great starting point.