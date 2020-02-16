<?php

namespace App\Http\Controllers;

//use App\Http\Resources\MarkerResource;

use App\Http\Resources\MarkerResource;
use App\Http\Resources\MarkerResourceCollection;
use Illuminate\Http\Request;
use App\Marker;

class MarkerController extends Controller
{
  public function show(Marker $marker): MarkerResource
  {
    // return new MarkerResource(Marker::find(5));

    return new MarkerResource($marker);
  }

  public function index(): MarkerResourceCollection
  {
    return new MarkerResourceCollection(Marker::paginate());
  }

  public function store(Request $request)
  {

    $request -> validate ([
      'inputTitle'       => 'required',
      'inputDescription' => 'required',
      'lat'              => 'required',
      'lng'              => 'required'
    ]);

    $marker = Marker::create($request->all());

    return new MarkerResource($marker);

  }

  public function update(Marker $marker, Request $request): MarkerResource
  {

    $marker -> update($request -> all());
    return new MarkerResource($marker);

  }

  public function destroy(Marker $marker)
  {

    $marker -> delete();

    return response() -> json();

  }



}
