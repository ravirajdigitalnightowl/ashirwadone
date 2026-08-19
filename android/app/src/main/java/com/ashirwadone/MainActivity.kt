package com.ashirwadone

import android.os.Build
import android.os.Bundle
import android.view.WindowManager
import android.app.KeyguardManager
import android.content.Context

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  override fun getMainComponentName(): String = "AshirwadOne"

  override fun onCreate(savedInstanceState: Bundle?) {
    // 👇 WAKE SCREEN & LOCK SCREEN BYPASS LOGIC 👇
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
        setShowWhenLocked(true)
        setTurnScreenOn(true)
        
        // 🔥 Android 13+ / OnePlus / Xiaomi par forced lock screen bypass
        val keyguardManager = getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager
        if (keyguardManager.isKeyguardLocked) {
            keyguardManager.requestDismissKeyguard(this, null)
        }
    } else {
        // 🔥 Purane Android OS ke liye
        window.addFlags(
            WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
            WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON or
            WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD
        )
    }

    // 🔥 Dono cases (Naye aur Purane OS) mein screen ko ON rakhne ke liye ye flag common kar diya hai
    window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

    super.onCreate(savedInstanceState)
  }
  // 👆 YAHAN TAK 👆

  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}