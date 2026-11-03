package com.drishtant.utilities;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.widget.RemoteViews;

public class UtilitiesWidgetProvider extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    private static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_utilities);

        // 1. Header & Catalog action -> Opens Catalog Dashboard
        views.setOnClickPendingIntent(R.id.widget_header, createToolPendingIntent(context, "home", 100));
        views.setOnClickPendingIntent(R.id.widget_btn_catalog, createToolPendingIntent(context, "home", 101));

        // 2. Notion Notes Action -> Deep links directly into Notion
        views.setOnClickPendingIntent(R.id.widget_action_notion, createToolPendingIntent(context, "notion-clone", 102));

        // 3. Indian Tax Simulator Action -> Deep links directly into Salary Calculator
        views.setOnClickPendingIntent(R.id.widget_action_tax, createToolPendingIntent(context, "salary-calculator", 103));

        // 4. Curatorial Photography Gallery Action -> Deep links directly into Visual Archive
        views.setOnClickPendingIntent(R.id.widget_action_portfolio, createToolPendingIntent(context, "visual-archive", 104));

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    private static PendingIntent createToolPendingIntent(Context context, String appId, int requestCode) {
        Intent intent = new Intent(context, MainActivity.class);
        intent.setAction("com.drishtant.utilities.ACTION_LAUNCH_TOOL");
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        intent.putExtra("launch_app_id", appId);

        return PendingIntent.getActivity(
                context,
                requestCode,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
    }
}
