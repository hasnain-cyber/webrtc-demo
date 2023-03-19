# WebRTC
This project is a demo of using WebRTC for real-time communication between two peers using Firestore for signalling. The demo allows users to make a video call between two browsers.

## Introduction
The WebRTC (Web Real Time Communication) API allows us to communicate peer to peer without the hassle of setting up network communication protocols, NAT traversals, different audio and video codecs, etc.

Note: NAT (Network Address Translation) is the mechanism by which the devices on a network are given public IPs to communicate on the internet.

## Theory and Code Outline
Note: __Signalling__ refers to the metacommunication details exchanged between the two peers from a common server, in our case, that server is Firestore. So, we have a collection called __calls__ on firestore which stores a single document having fields called __offer__ and __answer__ each of which contain the SDP objects for a single call (in our case, to keep things simple, the code is designed to deal with only one such document, and so, only one call can be made at a time.). The document further contains two collections, namely offerCandidates and answerCandidates, which contain ice candidates that the peers send for alternate communication. So, when a call (offer) is made, the caller writes its SDP object in the doc, and then waits for the remote peer to write the answer field in the same document. Now, the two peers try to connect directly, but if it is not possible, then the ice candidates are used.

Note: SDP (Session Description Protocol) contain the details of the session (call) for each peer, for example, the session ID, session name, etc. and also the port it can listen on, but it may happen, that the device is located behind a firewall, and so we need to use ICE candidates to facilitate communication. The SDPs also contain the audio and video codec supported by the peers, so that they may communcicate effectively.

Note: An ICE candidate is essentially a pair of IP address and PORT on which a peer may communicate with.

## Instructions
* Use npm install to install the required node modules first.
``` 
npm i
```

* Run using npm run dev
```
npm run dev
```

* On the localhost, use the call button initiate the call, and you will receive a id in the answer text field, use that id in some other device or browser, to answer the call.

## Warning
Using this application on institute network may prevent it from working due to unusual network configurations, so use mobile data in that case.