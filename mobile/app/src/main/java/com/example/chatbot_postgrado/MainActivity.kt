package com.example.chatbot_postgrado

import android.os.Bundle
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.viewinterop.AndroidView
import com.example.chatbot_postgrado.ui.theme.ChatbotpostgradoTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            ChatbotpostgradoTheme {
                Scaffold(
                    modifier = Modifier
                        .fillMaxSize()
                        .imePadding() // Ajusta la UI cuando aparece el teclado
                ) { innerPadding ->
                    WebViewScreen(
                        url = "https://chatbot-postgrado.vercel.app/",
                        modifier = Modifier.padding(innerPadding)
                    )
                }
            }
        }
    }
}

@Composable
fun WebViewScreen(
    url: String,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val webView = remember {
        WebView(context).apply {
            webViewClient = WebViewClient()
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.loadWithOverviewMode = true
            settings.useWideViewPort = true
            loadUrl(url)
        }
    }

    AndroidView(
        modifier = modifier.fillMaxSize(),
        factory = { webView }
    )
}

@Preview(showBackground = true)
@Composable
fun WebViewPreview() {
    ChatbotpostgradoTheme {
        WebViewScreen("https://www.google.com")
    }
}
