/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

import * as admin from "firebase-admin";
import { getFirestore, QueryDocumentSnapshot } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";
import { Change, FirestoreEvent, onDocumentCreated, onDocumentUpdated } from "firebase-functions/firestore";
import { AspartecUser } from "./models/aspartec.user";
import { Advice } from "./models/advice";
import { usersCollection } from "./types/collections";

admin.initializeApp();

const sendNotification = async (notification: any) => {
  try {
    const response = await getMessaging().send(notification);
    console.log("Notificación enviada:", response);
  } catch (error) {
    console.error("Error al enviar la notificación:", error);
  }
};

// exports.getServerDate = onRequest((_, res) => {
//   const serverTimestamp = Date.now();
//   res.send({ timestamp: serverTimestamp });
// });

exports.onAdviceCreated = onDocumentCreated("/advice/{docId}", async (event: FirestoreEvent<QueryDocumentSnapshot | undefined>) => {
  if (!event.data) return;

  const advice = <Advice> event.data.data();
  const student = <AspartecUser> (await getFirestore().collection(usersCollection).doc(advice.studentId).get()).data();
  const username = `${student.firstname} ${student.lastname1} ${student.lastname2}`.trim();

  const notification = {
    name: "Nueva asesoría",
    topic: `${advice.advisorId}`,
    data: {
      "status": "Abierta",
      "role": "Asesor" 
    },
    notification: {
      title: "¡Nueva asesoría solicitada! 📖",
      body: `El estudiante ${username} ha solicitado asesoría en la materia de ${advice.subject}. ¡Ven a echarle un vistazo!`,
    }
  }
  
  await sendNotification(notification);
});

exports.onAdviceChangeStatus = onDocumentUpdated("/advice/{docId}", async (event: FirestoreEvent<Change<QueryDocumentSnapshot> | undefined, { docId: string; }>) => {
  if (!event.data) return;

  const adviceBefore = <Advice> event.data.before.data();
  const adviceAfter = <Advice> event.data.after.data();

  if (adviceBefore.status === adviceAfter.status) return;

  let notification: any = null;
  
  switch (adviceAfter.status) {
    case "Cancelada":
      const student = <AspartecUser> (await getFirestore().collection(usersCollection).doc(adviceAfter.studentId).get()).data();
      const studentUsername = `${student.firstname} ${student.lastname1} ${student.lastname2}`.trim();
      notification = {
        name: "Asesoría cancelada",
        data: {
          "status": "Cancelada",
          "role": "Asesor" 
        },
        topic: adviceAfter.advisorId,
        notification: {
          title: "Asesoría cancelada ❌",
          body: `El estudiante ${studentUsername} ha cancelado la asesoría de la materia ${adviceAfter.subject}.`,
        }
      };
      break;
    case "Por evaluar":
      const advisor = <AspartecUser> (await getFirestore().collection(usersCollection).doc(adviceAfter.advisorId).get()).data();
      const advisorUsername = `${advisor.firstname} ${advisor.lastname1} ${advisor.lastname2}`.trim();
      notification = {
        name: "Asesoría cerrada",
        data: {
          "status": "Por evaluar",
          "role": "Estudiante" 
        },
        topic: adviceAfter.studentId,
        notification: {
          title: "Asesoría cerrada por el asesor 📒",
          body: `El asesor ${advisorUsername} ha cerrado la asesoría de la materia ${adviceAfter.subject}. ¡Califica su desempeño! ⭐`,
        }
      };
      break;
    case "Completada":
      if (adviceAfter.advisorRating > 0) 
        notification = {
          name: "Asesoría completada",
          data: {
            "status": "Completada",
            "role": "Asesor" 
          },
          topic: adviceAfter.advisorId,
          notification: {
            title: "Asesoría completada ✅",
            body: `Has obtenido una calificación de ${adviceAfter.advisorRating} ⭐ ${adviceAfter.advisorRating == 1 ? "estrella" : "estrellas"} en la asesoría impartida de la materia ${adviceAfter.subject}.`,
          }
        };
      break;
    case "Omitida":
      break;
    case "Abierta":
      break;
  }

  if (!notification) return;
  await sendNotification(notification);
});
