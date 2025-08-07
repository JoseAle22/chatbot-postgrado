package com.example.chatbot_postgrado

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import com.example.chatbot_postgrado.ui.theme.ChatbotpostgradoTheme

// NUEVOS IMPORTS PARA WEBVIEW
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.ui.viewinterop.AndroidView

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            ChatbotpostgradoTheme {
                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                    // CAMBIA ESTO: En lugar de Greeting, usa WebViewScreen
                    WebViewScreen(
                        url = "https://chatbot-postgrado.vercel.app/", // Cambia por tu URL
                        modifier = Modifier.padding(innerPadding)
                    )
                }
            }
        }
    }
}

@Composable
fun Greeting(name: String, modifier: Modifier = Modifier) {
    Text(
        text = "Hello $name!",
        modifier = modifier
    )
}

// AGREGA ESTE COMPONENTE AQUÍ ⬇️
@Composable
fun WebViewScreen(
    url: String,
    modifier: Modifier = Modifier
) {
    AndroidView(
        modifier = modifier.fillMaxSize(),
        factory = { context ->
            WebView(context).apply {
                webViewClient = WebViewClient()

                settings.apply {
                    javaScriptEnabled = true
                    domStorageEnabled = true
                    loadWithOverviewMode = true
                    useWideViewPort = true
                }

                loadUrl(url)
            }
        }
    )
}

@Preview(showBackground = true)
@Composable
fun GreetingPreview() {
    ChatbotpostgradoTheme {
        Greeting("Android")
    }
}

// OPCIONAL: Preview para WebView
@Preview(showBackground = true)
@Composable
fun WebViewPreview() {
    ChatbotpostgradoTheme {
        WebViewScreen("https://www.google.com")
    }
}