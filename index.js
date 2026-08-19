
// import { AppRegistry } from 'react-native';
// import App from './App';
// import { name as appName } from './app.json';
// import messaging from '@react-native-firebase/messaging';
// import notifee, { AndroidImportance, AndroidCategory, AndroidVisibility, EventType } from '@notifee/react-native'; 
// import AsyncStorage from '@react-native-async-storage/async-storage'; 

// // 🔥 1. BACKGROUND MESSAGE HANDLER
// messaging().setBackgroundMessageHandler(async remoteMessage => {
//   console.log('Background message aagaya!', remoteMessage);

//   // 🔥 UPDATE: Sirf GATE_APPROVAL ke liye Full-Screen Alarm trigger hoga. 
//   // Baki notifications FCM apne aap silently device tray mein dikha dega.
//   if (remoteMessage.data?.type === 'GATE_APPROVAL') {
//     const channelId = await notifee.createChannel({
//       id: 'high_priority_gate_channel',
//       name: 'Gate Alerts',
//       importance: AndroidImportance.HIGH,
//       visibility: AndroidVisibility.PUBLIC, 
//       sound: 'default',
//       vibration: true,
//     });

//     await notifee.displayNotification({
//       title: remoteMessage.data?.visitorType ? `${remoteMessage.data.visitorType} at Gate 🚨` : 'New Gate Entry',
//       body: remoteMessage.data?.visitorName ? `${remoteMessage.data.visitorName} is waiting for approval.` : 'Tap to view details.',
//       data: remoteMessage.data, 
//       android: {
//         channelId,
//         category: AndroidCategory.CALL, 
//         importance: AndroidImportance.HIGH,
//         visibility: AndroidVisibility.PUBLIC,
//         fullScreenAction: {
//           id: 'default',
//         },
//         pressAction: {
//           id: 'default',
//           launchActivity: 'default',
//         },
//       },
//     });
//   }
// });

// // 🔥 2. NOTIFEE BACKGROUND EVENT HANDLER
// notifee.onBackgroundEvent(async ({ type, detail }) => {
//   if (type === EventType.PRESS && detail.notification?.data) {
//     console.log('Notifee tapped in background, saving data to AsyncStorage...', detail.notification.data);
//     try {
//       // 🔥 UPDATE: Key ka naam change kiya (RootNavigator se match karne ke liye)
//       await AsyncStorage.setItem('pending_notification_data', JSON.stringify(detail.notification.data));
//     } catch (error) {
//       console.log('Error saving pending navigation:', error);
//     }
//   }
// });

// AppRegistry.registerComponent(appName, () => App);





// import { AppRegistry } from 'react-native';
// import App from './App';
// import { name as appName } from './app.json';
// import messaging from '@react-native-firebase/messaging';
// import notifee, { AndroidImportance, AndroidCategory, AndroidVisibility, EventType } from '@notifee/react-native'; 
// import AsyncStorage from '@react-native-async-storage/async-storage'; 

// // 🔥 1. BACKGROUND MESSAGE HANDLER
// messaging().setBackgroundMessageHandler(async remoteMessage => {
//   console.log('Background message aagaya!', remoteMessage);

//   if (remoteMessage.data?.type === 'GATE_APPROVAL') {
//     const channelId = await notifee.createChannel({
//       id: 'high_priority_gate_channel',
//       name: 'Gate Alerts',
//       importance: AndroidImportance.HIGH,
//       visibility: AndroidVisibility.PUBLIC, 
//       sound: 'default',
//       vibration: true,
//       bypassDnd: true, // DND bypass karega
//     });

//     await notifee.displayNotification({
//       title: remoteMessage.data?.visitorType ? `${remoteMessage.data.visitorType} at Gate 🚨` : 'New Gate Entry',
//       body: remoteMessage.data?.visitorName ? `${remoteMessage.data.visitorName} is waiting for approval.` : 'Tap to view details.',
//       data: remoteMessage.data, 
//       android: {
//         channelId,
//         category: AndroidCategory.CALL, 
//         importance: AndroidImportance.HIGH,
//         visibility: AndroidVisibility.PUBLIC,
//         ongoing: true, // Lock screen par notification fix rakhega
//         autoCancel: false, 
//         timeoutAfter: 45000, // 45 seconds baad expire hoga
//         pressAction: {
//           id: 'default',
//           launchActivity: 'default',
//         },
//         fullScreenAction: {
//           id: 'default',
//           launchActivity: 'default', // Screen lock bypass ke liye zaroori
//         },
//       },
//     });
//   }
// });

// // 🔥 2. NOTIFEE BACKGROUND EVENT HANDLER
// notifee.onBackgroundEvent(async ({ type, detail }) => {
//   if (type === EventType.PRESS && detail.notification?.data) {
//     try {
//       await AsyncStorage.setItem('pending_notification_data', JSON.stringify(detail.notification.data));
//     } catch (error) {
//       console.log('Error saving pending navigation:', error);
//     }
//   }
// });

// AppRegistry.registerComponent(appName, () => App);


// import { AppRegistry } from 'react-native';
// import App from './App';
// import { name as appName } from './app.json';
// import messaging from '@react-native-firebase/messaging';
// import notifee, { AndroidImportance, AndroidCategory, AndroidVisibility, EventType } from '@notifee/react-native'; 
// import AsyncStorage from '@react-native-async-storage/async-storage'; 

// // 🔥 1. BACKGROUND MESSAGE HANDLER
// messaging().setBackgroundMessageHandler(async remoteMessage => {
//   console.log('Background message aagaya!', remoteMessage);

//   if (remoteMessage.data?.type === 'GATE_APPROVAL') {
    
//     // 🔥 FIX 1: App lock screen par open hone se pehle data save kar lo
//     // Taaki RootNavigator mount hote hi isko read karke GateApprovalScreen par chala jaye
//     try {
//       await AsyncStorage.setItem('pending_notification_data', JSON.stringify(remoteMessage.data));
//     } catch (error) {
//       console.log('Error saving data:', error);
//     }

//     const channelId = await notifee.createChannel({
//       id: 'high_priority_gate_channel',
//       name: 'Gate Alerts',
//       importance: AndroidImportance.HIGH,
//       visibility: AndroidVisibility.PUBLIC, 
//       sound: 'default',
//       vibration: true,
//       bypassDnd: true, // DND bypass karega
//     });

//     await notifee.displayNotification({
//       title: remoteMessage.data?.visitorType ? `${remoteMessage.data.visitorType} at Gate 🚨` : 'New Gate Entry',
//       body: remoteMessage.data?.visitorName ? `${remoteMessage.data.visitorName} is waiting for approval.` : 'Tap to view details.',
//       data: remoteMessage.data, 
//       android: {
//         channelId,
//         category: AndroidCategory.CALL, 
//         importance: AndroidImportance.HIGH,
//         visibility: AndroidVisibility.PUBLIC,
//         ongoing: true, // Lock screen par notification fix rakhega
//         autoCancel: false, 
//         timeoutAfter: 45000, // 45 seconds baad expire hoga
//         pressAction: {
//           id: 'default',
//           launchActivity: 'default',
//         },
//         fullScreenAction: {
//           id: 'default',
//           launchActivity: 'default', // Screen lock bypass ke liye zaroori
//         },
//       },
//     });
//   }
// });

// // 🔥 2. NOTIFEE BACKGROUND EVENT HANDLER
// notifee.onBackgroundEvent(async ({ type, detail }) => {
//   if (type === EventType.PRESS && detail.notification?.data) {
//     try {
//       await AsyncStorage.setItem('pending_notification_data', JSON.stringify(detail.notification.data));
//     } catch (error) {
//       console.log('Error saving pending navigation:', error);
//     }
//   } 
//   // 🔥 FIX 2: Agar user ne reject/dismiss kar diya swip karke, toh storage clear kardo
//   else if (type === EventType.DISMISSED) {
//     try {
//       await AsyncStorage.removeItem('pending_notification_data');
//     } catch (error) {
//       console.log('Error clearing pending navigation:', error);
//     }
//   }
// });

// AppRegistry.registerComponent(appName, () => App);





// import { AppRegistry } from 'react-native';
// import App from './App';
// import { name as appName } from './app.json';
// import messaging from '@react-native-firebase/messaging';
// import notifee, { AndroidImportance, AndroidCategory, AndroidVisibility, EventType } from '@notifee/react-native'; 
// import AsyncStorage from '@react-native-async-storage/async-storage'; 

// // 🔥 1. BACKGROUND MESSAGE HANDLER
// messaging().setBackgroundMessageHandler(async remoteMessage => {
//   console.log('Background message aagaya!', remoteMessage);

//   if (remoteMessage.data?.type === 'GATE_APPROVAL') {
    
//     // 🔥 FIX 1: App lock screen par open hone se pehle data save kar lo
//     // Taaki RootNavigator mount hote hi isko read karke GateApprovalScreen par chala jaye
//     try {
//       await AsyncStorage.setItem('pending_notification_data', JSON.stringify(remoteMessage.data));
//     } catch (error) {
//       console.log('Error saving data:', error);
//     }

//     // 🔥 NAYA UPDATE: Channel ID aur Sound change kiya gaya hai custom ringtone ke liye
//     const channelId = await notifee.createChannel({
//       id: 'high_priority_gate_channel_v2', // Purane cache ko bypass karne ke liye 'v2' lagaya
//       name: 'Gate Alerts',
//       importance: AndroidImportance.HIGH,
//       visibility: AndroidVisibility.PUBLIC, 
//       sound: 'gate_ringtone', // Yahan '.mp3' mat lagana, sirf file ka naam
//       vibration: true,
//       bypassDnd: true, // DND bypass karega
//     });

//     await notifee.displayNotification({
//       title: remoteMessage.data?.visitorType ? `${remoteMessage.data.visitorType} at Gate 🚨` : 'New Gate Entry',
//       body: remoteMessage.data?.visitorName ? `${remoteMessage.data.visitorName} is waiting for approval.` : 'Tap to view details.',
//       data: remoteMessage.data, 
//       android: {
//         channelId,
//         category: AndroidCategory.CALL, 
//         importance: AndroidImportance.HIGH,
//         visibility: AndroidVisibility.PUBLIC,
//         ongoing: true, // Lock screen par notification fix rakhega
//         autoCancel: false, 
//         timeoutAfter: 45000, // 45 seconds baad expire hoga
//         pressAction: {
//           id: 'default',
//           launchActivity: 'default',
//         },
//         fullScreenAction: {
//           id: 'default',
//           launchActivity: 'default', // Screen lock bypass ke liye zaroori
//         },
//       },
//     });
//   }
// });

// // 🔥 2. NOTIFEE BACKGROUND EVENT HANDLER
// notifee.onBackgroundEvent(async ({ type, detail }) => {
//   if (type === EventType.PRESS && detail.notification?.data) {
//     try {
//       await AsyncStorage.setItem('pending_notification_data', JSON.stringify(detail.notification.data));
//     } catch (error) {
//       console.log('Error saving pending navigation:', error);
//     }
//   } 
//   // 🔥 FIX 2: Agar user ne reject/dismiss kar diya swipe karke, toh storage clear kardo
//   else if (type === EventType.DISMISSED) {
//     try {
//       await AsyncStorage.removeItem('pending_notification_data');
//     } catch (error) {
//       console.log('Error clearing pending navigation:', error);
//     }
//   }
// });

// AppRegistry.registerComponent(appName, () => App);


// import { AppRegistry } from 'react-native';
// import App from './App';
// import { name as appName } from './app.json';
// import messaging from '@react-native-firebase/messaging';
// import notifee, { AndroidImportance, AndroidCategory, AndroidVisibility, EventType } from '@notifee/react-native'; 
// import AsyncStorage from '@react-native-async-storage/async-storage'; 

// // 🔥 1. BACKGROUND MESSAGE HANDLER
// messaging().setBackgroundMessageHandler(async remoteMessage => {
//   console.log('Background message aagaya!', remoteMessage);

//   if (remoteMessage.data?.type === 'GATE_APPROVAL') {
    
//     // 🔥 FIX 1: App lock screen par open hone se pehle data save kar lo
//     // Taaki RootNavigator mount hote hi isko read karke GateApprovalScreen par chala jaye
//     try {
//       await AsyncStorage.setItem('pending_notification_data', JSON.stringify(remoteMessage.data));
//     } catch (error) {
//       console.log('Error saving data:', error);
//     }

//     // Channel ID aur Sound custom ringtone ke liye
//     const channelId = await notifee.createChannel({
//       id: 'high_priority_gate_channel_v2', // Purane cache ko bypass karne ke liye 'v2' lagaya
//       name: 'Gate Alerts',
//       importance: AndroidImportance.HIGH,
//       visibility: AndroidVisibility.PUBLIC, 
//       sound: 'gate_ringtone', // Yahan '.mp3' mat lagana, sirf file ka naam
//       vibration: true,
//       bypassDnd: true, // DND bypass karega
//     });

//     await notifee.displayNotification({
//       title: remoteMessage.data?.visitorType ? `${remoteMessage.data.visitorType} at Gate 🚨` : 'New Gate Entry',
//       body: remoteMessage.data?.visitorName ? `${remoteMessage.data.visitorName} is waiting for approval.` : 'Tap to view details.',
//       data: remoteMessage.data, 
//       android: {
//         channelId,
//         category: AndroidCategory.CALL, 
//         importance: AndroidImportance.HIGH,
//         visibility: AndroidVisibility.PUBLIC,
//         ongoing: true, // Lock screen par notification fix rakhega
//         loopSound: true, // 🔥 NAYA UPDATE: Ringtone ko lagatar repeat karne ke liye
//         autoCancel: false, 
//         timeoutAfter: 45000, // 45 seconds baad expire hoga
//         pressAction: {
//           id: 'default',
//           launchActivity: 'default',
//         },
//         fullScreenAction: {
//           id: 'default',
//           launchActivity: 'default', // Screen lock bypass ke liye zaroori
//         },
//       },
//     });
//   }
// });

// // 🔥 2. NOTIFEE BACKGROUND EVENT HANDLER
// notifee.onBackgroundEvent(async ({ type, detail }) => {
//   if (type === EventType.PRESS && detail.notification?.data) {
//     try {
//       await AsyncStorage.setItem('pending_notification_data', JSON.stringify(detail.notification.data));
//     } catch (error) {
//       console.log('Error saving pending navigation:', error);
//     }
//   } 
//   // 🔥 FIX 2: Agar user ne reject/dismiss kar diya swipe karke, toh storage clear kardo
//   else if (type === EventType.DISMISSED) {
//     try {
//       await AsyncStorage.removeItem('pending_notification_data');
//     } catch (error) {
//       console.log('Error clearing pending navigation:', error);
//     }
//   }
// });

// AppRegistry.registerComponent(appName, () => App);




import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, AndroidCategory, AndroidVisibility, EventType } from '@notifee/react-native'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; 

// 🔥 1. BACKGROUND MESSAGE HANDLER
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Background message aagaya!', remoteMessage);

  if (remoteMessage.data?.type === 'GATE_APPROVAL') {
    
    // 🔥 FIX 1: App lock screen par open hone se pehle data save kar lo
    // Taaki RootNavigator mount hote hi isko read karke GateApprovalScreen par chala jaye
    try {
      await AsyncStorage.setItem('pending_notification_data', JSON.stringify(remoteMessage.data));
    } catch (error) {
      console.log('Error saving data:', error);
    }

    // Channel ID aur Sound custom ringtone ke liye
    const channelId = await notifee.createChannel({
      id: 'high_priority_gate_channel_v2', // Purane cache ko bypass karne ke liye 'v2' lagaya
      name: 'Gate Alerts',
      importance: AndroidImportance.HIGH,
      visibility: AndroidVisibility.PUBLIC, 
      sound: 'gate_ringtone', // Yahan '.mp3' mat lagana, sirf file ka naam
      vibration: true,
      bypassDnd: true, // DND bypass karega
    });

    await notifee.displayNotification({
      title: remoteMessage.data?.visitorType ? `${remoteMessage.data.visitorType} at Gate 🚨` : 'New Gate Entry',
      body: remoteMessage.data?.visitorName ? `${remoteMessage.data.visitorName} is waiting for approval.` : 'Tap to view details.',
      data: remoteMessage.data, 
      android: {
        channelId,
        category: AndroidCategory.CALL, 
        importance: AndroidImportance.HIGH,
        visibility: AndroidVisibility.PUBLIC,
        ongoing: true, // Lock screen par notification fix rakhega
        loopSound: true, // 🔥 NAYA UPDATE: Ringtone ko lagatar repeat karne ke liye
        autoCancel: false, 
        timeoutAfter: 45000, // 45 seconds baad expire hoga
        pressAction: {
          id: 'default',
          launchActivity: 'default',
        },
        fullScreenAction: {
          id: 'default',
          launchActivity: 'default', // Screen lock bypass ke liye zaroori
        },
      },
    });
  } 
  // 🔥🔥🔥 NAYA FIX: BAAKI SABHI FLOWS KE LIYE YAHAN ELSE BLOCK AAYEGA 🔥🔥🔥
  else {
    // 1. Pending data save karein
    try {
      if (remoteMessage.data) {
        await AsyncStorage.setItem('pending_notification_data', JSON.stringify(remoteMessage.data));
      }
    } catch (error) {
      console.log('Error saving general notification data:', error);
    }

    // 2. Naya channel create karein high importance ke sath taaki popup dikhe
    const defaultChannelId = await notifee.createChannel({
      id: 'default_general_alerts',
      name: 'General Updates',
      importance: AndroidImportance.HIGH, // Android 13+ mein Heads-up pop-up dikhane ke liye
      vibration: true,
    });

    // 3. Notification show karein
    await notifee.displayNotification({
      title: remoteMessage.notification?.title || remoteMessage.data?.title || 'New Update 📢',
      body: remoteMessage.notification?.body || remoteMessage.data?.body || 'Tap to view details.',
      data: remoteMessage.data, 
      android: {
        channelId: defaultChannelId,
        smallIcon: 'ic_launcher', // AndroidManifest wale default icon se match karega
        pressAction: {
          id: 'default',
          launchActivity: 'default',
        },
      },
    });
  }
});

// 🔥 2. NOTIFEE BACKGROUND EVENT HANDLER
notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.PRESS && detail.notification?.data) {
    try {
      await AsyncStorage.setItem('pending_notification_data', JSON.stringify(detail.notification.data));
    } catch (error) {
      console.log('Error saving pending navigation:', error);
    }
  } 
  // 🔥 FIX 2: Agar user ne reject/dismiss kar diya swipe karke, toh storage clear kardo
  else if (type === EventType.DISMISSED) {
    try {
      await AsyncStorage.removeItem('pending_notification_data');
    } catch (error) {
      console.log('Error clearing pending navigation:', error);
    }
  }
});

AppRegistry.registerComponent(appName, () => App);