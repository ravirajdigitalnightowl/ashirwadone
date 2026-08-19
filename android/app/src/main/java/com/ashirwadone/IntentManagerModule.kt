package com.ashirwadone
import android.content.ComponentName
import android.content.Intent
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class IntentManagerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    // Yeh naam React Native mein 'NativeModules.IntentManager' ke roop mein expose hoga
    override fun getName(): String {
        return "IntentManager"
    }

    @ReactMethod
    fun startSpecificActivity(packageName: String, className: String, promise: Promise) {
        try {
            val intent = Intent()
            intent.component = ComponentName(packageName, className)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK) // Background se launch karne ke liye zaroori
            
            reactApplicationContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            // Agar phone mein wo specific activity nahi mili toh error throw karega
            promise.reject("ACTIVITY_NOT_FOUND", "Failed to launch activity: ${e.message}")
        }
    }
}