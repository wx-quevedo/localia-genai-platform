<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('user_jobs', function (Blueprint $table) {
            $table->json('chat_history')->nullable()->after('inputs');
        });
    }

    public function down(): void
    {
        Schema::table('user_jobs', function (Blueprint $table) {
            $table->dropColumn('chat_history');
        });
    }
};
