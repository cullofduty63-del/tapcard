package ir.lumocard.app;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.graphics.Color;
import android.content.Intent;
import android.net.Uri;

public class MainActivity extends Activity {
    private WebView web;
    private static final String HOME = "https://lumocard.ir/";
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        Window w = getWindow(); w.setStatusBarColor(Color.rgb(9,8,12)); w.setNavigationBarColor(Color.rgb(9,8,12));
        web = new WebView(this); setContentView(web);
        WebSettings s = web.getSettings(); s.setJavaScriptEnabled(true); s.setDomStorageEnabled(true); s.setDatabaseEnabled(true); s.setLoadWithOverviewMode(true); s.setUseWideViewPort(true); s.setJavaScriptCanOpenWindowsAutomatically(true); s.setSupportMultipleWindows(false);
        web.setBackgroundColor(Color.rgb(9,8,12)); web.setWebChromeClient(new WebChromeClient());
        web.setWebViewClient(new WebViewClient(){
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri=request.getUrl(); String host=uri.getHost();
                if(host!=null && (host.equals("lumocard.ir") || host.endsWith(".lumocard.ir"))) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW,uri)); } catch(Exception ignored) {}
                return true;
            }
        });
        if(state!=null) web.restoreState(state); else web.loadUrl(HOME);
    }
    @Override protected void onSaveInstanceState(Bundle out){web.saveState(out);super.onSaveInstanceState(out);}
    @Override public void onBackPressed(){if(web!=null && web.canGoBack()) web.goBack(); else super.onBackPressed();}
}
