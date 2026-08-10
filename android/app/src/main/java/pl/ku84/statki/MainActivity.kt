package pl.ku84.statki

import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import android.os.Bundle
import android.view.View
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    private lateinit var webView: WebView
    private var urlFailed = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        webView = WebView(this).apply {
            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                mediaPlaybackRequiresUserGesture = false
                allowFileAccess = false
                allowContentAccess = false
                setSupportZoom(false)
            }
            webChromeClient = WebChromeClient()
            webViewClient = object : WebViewClient() {
                @Deprecated("Deprecated in Java")
                override fun onReceivedError(
                    view: WebView, errorCode: Int, description: String, failingUrl: String
                ) {
                    if (!urlFailed) { urlFailed = true; loadUrl("file:///android_asset/game.html") }
                }
                override fun onReceivedError(
                    view: WebView, request: WebResourceRequest, error: WebResourceError
                ) {
                    if (!urlFailed && request.isForMainFrame) {
                        urlFailed = true; loadUrl("file:///android_asset/game.html")
                    }
                }
                override fun onReceivedHttpError(
                    view: WebView, request: WebResourceRequest, response: WebResourceResponse
                ) {
                    if (!urlFailed && request.isForMainFrame && response.statusCode >= 400) {
                        urlFailed = true; loadUrl("file:///android_asset/game.html")
                    }
                }
            }
            loadUrl("https://ku84-xxx.github.io/ships_multi/")
        }
        setContentView(webView)

        if (android.os.Build.VERSION.SDK_INT >= 30) {
            WindowCompat.setDecorFitsSystemWindows(window, false)
            WindowInsetsControllerCompat(window, webView).apply {
                hide(WindowInsetsCompat.Type.systemBars())
                systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
            }
        } else {
            @Suppress("DEPRECATION")
            window.decorView.systemUiVisibility = (
                View.SYSTEM_UI_FLAG_FULLSCREEN
                or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                or View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                or View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            )
        }
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) webView.goBack()
        else super.onBackPressed()
    }
}
