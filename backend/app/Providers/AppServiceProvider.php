<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('ai-generate', function (Request $request): array {
            $ip = $request->ip();

            return [
                Limit::perMinute(config('services.openai.rate_limit_per_minute'))->by('minute:'.$ip),
                Limit::perDay(config('services.openai.rate_limit_per_day'))->by('day:'.$ip),
            ];
        });
    }
}
