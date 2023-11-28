import React, { useState, useEffect } from "react";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { useParams } from "react-router-dom";
import { db } from "../utils/firebase";
import Input from "../components/form-controls/Input";

const Createion = () => {
  const { id } = useParams();
  const [request, setRequest] = useState(null);

  useEffect(() => {
    const requestsRef = collection(db, "requests");
    const docRef = doc(requestsRef, id);

    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists) {
        setRequest(doc.data());
      } else {
        setRequest(null);
      }
    });
    return () => unsubscribe();
  }, []);

  if (!request) {
    return (
      <main className="container">
        <img
          className="d-block rotate-img w-25 vh-100 mx-auto"
          src="/kawwa-round.svg"
          alt="Kawwa"
          style={{
            marginTop: "-7%",
          }}
        />
      </main>
    );
  }

  return (
    <main className="container">
      <h2 className="mb-3">
        {request.brandName}
        <span className="colr-dot">.</span>
      </h2>
      {request && request.processedVideo ? (
        <>
          <video className="fg-vid" autoPlay loop controls>
            <source src={request.processedVideo} type="video/mp4" />
          </video>
          <div className="mb-5 d-flex">
            <button className="sd-btn-sm">Download</button>
            <button className="sd-btn-sm ms-3">Copy</button>
          </div>
        </>
      ) : (
        <code className="d-block mb-5 p-3 bg-dark text-white rounded">
          <p>VIDEO UNDER PROCESSING...</p>
          {request &&
            (request.logs ?? []).map(({ timestamp, message }) => {
              return (
                <p>
                  [{timestamp}] {message}
                </p>
              );
            })}
        </code>
      )}
      <div className="row flex-md-row-reverse">
        <div className="col-12 col-md-6 p-2">
          <h3 className="mb-3">Asset Uploaded.</h3>
          <img className="mw-100" src={request.logo} alt="asset" />
        </div>
        <div className="col-12 col-md-6 p-2">
          <h3 className="mb-3 ">Description.</h3>
          <p className="lh-base">{request.brandDescription}</p>
          <Input
            value={request.youtubeVideoLink}
            className="w-100"
            outerClassName="col-lg-8 col-7 w-100 mb-3 mt-5"
            label={{
              text: "YouTube video link.",
              props: { className: "mb-3" },
            }}
          />
        </div>
      </div>
    </main>
  );
};

export default Createion;
