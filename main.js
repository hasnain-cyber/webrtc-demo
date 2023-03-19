import { collection, getDocs, setDoc, updateDoc, doc, addDoc, onSnapshot, getDoc } from "firebase/firestore";
import { db } from './firebaseConfig';

const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
    }
  ]
};

// global states
const peerConnection = new RTCPeerConnection(servers);
let localStream = null;
let remoteStream = null;

// getting the html elements from dom
const webcamButton = document.getElementById('webcamButton');
const webcamVideo = document.getElementById('webcamVideo');
const callButton = document.getElementById('callButton');
const callInput = document.getElementById('callInput');
const answerButton = document.getElementById('answerButton');
const remoteVideo = document.getElementById('remoteVideo');

webcamButton.onclick = async () => {
  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  remoteStream = new MediaStream();

  // now add all the tracks of localStream to the peerConnection object, tracks refer to the different types of data 'streams' that consist of the localStream, like audio, video, etc.
  localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

  // this is to show the remote stream on the remote video element
  peerConnection.ontrack = event => {
    event.streams[0].getTracks().forEach(track => {
      remoteStream.addTrack(track);
    });
  }

  webcamVideo.srcObject = localStream;
  remoteVideo.srcObject = remoteStream;
}


callButton.onclick = async () => {
  const collectionRef = collection(db, 'calls');
  const querySnapshot = await getDocs(collectionRef);
  const docsArray = querySnapshot.docs;
  const callDoc = doc(collectionRef, docsArray[0].id);

  const offerCandidates = collection(callDoc, 'offerCandidates')
  const answerCandidates = collection(callDoc, 'answerCandidates');

  callInput.value = callDoc.id;

  // add ice candidate to collection doc, as it is generated.
  peerConnection.onicecandidate = event => {
    event.candidate && addDoc(offerCandidates, event.candidate.toJSON());
  }

  // this is to create an offer
  const offerDescription = await peerConnection.createOffer();
  // as soon as the local or remote description are set, the ice candidate generation starts.
  // which is taken care of by the onicecandidate event listener above.
  await peerConnection.setLocalDescription(offerDescription);

  const offer = {
    sdp: offerDescription.sdp,
    type: offerDescription.type,
  };

  await setDoc(callDoc, { offer });

  // check to receive the call.
  onSnapshot(callDoc, (snapshot) => {
    const data = snapshot.data();
    if (!peerConnection.currentRemoteDescription && data?.answer) {
      const answerDescription = new RTCSessionDescription(data.answer);
      peerConnection.setRemoteDescription(answerDescription);
    }
  });
  
  // to keep track of alternate ice candidates on the remote side.
  onSnapshot(answerCandidates, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const candidate = new RTCIceCandidate(change.doc.data());
        peerConnection.addIceCandidate(candidate);
      }
    });
  });
}

answerButton.onclick = async () => {
  const callId = callInput.value;
  const callDoc = doc(db, 'calls', callId);
  const answerCandidates = collection(callDoc, 'answerCandidates');
  const offerCandidates = collection(callDoc, 'offerCandidates');

  peerConnection.onicecandidate = event => {
    event.candidate && addDoc(answerCandidates, event.candidate.toJSON());
  }

  const callData = (await getDoc(callDoc)).data();

  const offerDescription = callData.offer;
  await peerConnection.setRemoteDescription(new RTCSessionDescription(offerDescription));

  const answerDescription = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answerDescription);

  const answer = {
    type: answerDescription.type,
    sdp: answerDescription.sdp,
  };

  await updateDoc(callDoc, { answer });

  onSnapshot(offerCandidates, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        let data = change.doc.data();
        peerConnection.addIceCandidate(new RTCIceCandidate(data));
      }
    });
  });
}