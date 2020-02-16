<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Marker extends Model
{
    protected $fillable = [
        'inputTitle',
        'inputDescription',
        'lat',
        'lng'            
    ];
}
