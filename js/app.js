function main() {

  var sql_partners = [ // define partners sql
    'WITH m AS (',
    'SELECT', 
    ' array_agg(cartodb_id) id_list,', 
    ' the_geom_webmercator,', 
    ' ST_Y(the_geom_webmercator) y', 
    ' FROM ramirocartodb.partners_map_dataset_wo',
    ' GROUP BY the_geom_webmercator', 
    ' ORDER BY y DESC',
    '),', 
    'f AS (',
    'SELECT',  
    ' generate_series(1, array_length(id_list,1)) p,', 
    ' unnest(id_list) cartodb_id,', 
    ' the_geom_webmercator', 
    ' FROM m',
    ')',
    ' SELECT',  
    ' ST_Translate(f.the_geom_webmercator,0,f.p*yOffset) the_geom_webmercator,', 
    ' f.cartodb_id,', 
    ' q.city,', 
    ' q.country,', 
    ' q.description,', 
    ' q.logo,', 
    ' q.partner_s_name,', 
    ' q.url,', 
    ' q.region',
    '  FROM f, ramirocartodb.partners_map_dataset_wo q',
    '  WHERE f.cartodb_id = q.cartodb_id'
  ].join('\n');

  var sql_emea = " AND q.region ILIKE ('EMEA')"; // define partners subqueries
  var sql_na = " AND q.region ILIKE ('NA')";
  var sql_latam = " AND q.region ILIKE ('LATAM')";
  var sql_apac = " AND q.region ILIKE ('APAC')";

  var stylePartners = [ // define partners style
    '#cbd_partners_dataset{',
    '  marker-fill-opacity: 0.9;',
    '  marker-line-color: darken(#ffcc00, 40);',
    '  marker-line-width: 0.5;',
    '  marker-line-opacity: 1;',
    '  marker-placement: point;',
    '  marker-type: ellipse;',
    '  marker-width: 8;',
    '  marker-fill: #ffcc00;',
    '  marker-allow-overlap: true;',
    '  [zoom = 3] {marker-line-width: 0.20;}',
    '  [zoom = 4] {marker-line-width: 0.20;}',
    '}'
    ].join('\n');

  var styleOffice = [ // define offices style
    '#cbd_partners_ds_sc{',
    '  marker-fill-opacity: 1;',
    '  marker-line-color: #7fcdbb;',
    '  marker-line-width: 1;',
    '  marker-line-opacity: 0;',
    '  marker-placement: point;',
    '  marker-type: ellipse;',
    '  marker-width: 4;',
    '  marker-fill: #91e1d8;',
    '  marker-allow-overlap: true;',
    '}',
    '#cbd_offices_ds::point{',
    '  marker-fill-opacity: 0.5;',
    '  marker-line-color: #7fcdbb;',
    '  marker-line-width: 1;',
    '  marker-line-opacity: 1;',
    '  marker-placement: point;',
    '  marker-type: ellipse;',
    '  marker-width: 12;',
    '  marker-fill: #91e1d8;',
    '  marker-allow-overlap: true;',
    '}'
    ].join('\n');

  var styleLabels = [ //define labels style
    'Map {',
    '  buffer-size: 2000;',
    '}',
    '#cbd_offices_ds_sc::labels [zoom>=3]{',
    '  text-name: [partner_s_name];',
    '  text-face-name: "Open Sans Bold";',
    '  text-size: 12;',
    '  text-fill: #FFFFFF;',
    '  text-halo-fill: fadeout(#000000, 30%);',
    '  text-halo-radius: 2;',
    '  text-allow-overlap: true;',
    '  text-placement: point;',
    '  text-placement-type: simple;',
    '  text-dy: 10;',
    '}'
   ].join('\n');

  var styleLinks = [ // define links style
    '#cbd_offices_ds_links{',
     'line-color: rgb(175,94,122);',
     'line-width: 1.5;',
     'line-opacity: 0.4;',
     '}',
  ].join('\n');

    var styleGrid = [ // define grid style
      '#ne_50m_graticules_15 {',
      ' line-color: #636464 ;',
      ' line-width: 1;',
      ' line-opacity: 0.4;',
      '}'
  ].join('\n');

    var styleLand = [ // define land style
      '#ne_50m_land{',  
      'polygon-fill: rgb(49,39,64);',
      '}'
  ].join('\n');

  var region; // define region, country, city, partner variables
  var country;
  var city;
  var partner;

  var zoom3_yOffset = '60000'; // define yoffsets according to zoom level
  var zoom4_yOffset = '30000';

  // define map object
  var map = new L.Map('map', { 
    zoomControl: false,
    center: [30, -45],
    zoom: 3
  });

  // define CartoDB layer with createLayer() - basemap & layers
  cartodb.createLayer(map, { 
    user_name: 'ramirocartodb',
    type: 'cartodb',
    sublayers: [
      {
         type: "mapnik", // layer 0
         sql: 'SELECT * FROM ne_50m_graticules_15',
         cartocss: styleGrid,
         interactivity: ['cartodb_id']
      },
      {
         type: "mapnik", // layer 1
         sql: 'SELECT * FROM ne_50m_land',
         cartocss: styleLand,
         interactivity: ['cartodb_id']
      },
      {
         type: "mapnik", // layer 2
         sql: 'SELECT * FROM cbd_offices_ds',
         cartocss: styleOffice,
         interactivity: ['cartodb_id','partner_s_name', 'url', 'logo', 'url', 'city', 'description', 'country','region']
      },
      {
         type: "mapnik", // layer 3
         sql: sql_partners.replace('yOffset', zoom3_yOffset),
         cartocss: stylePartners,
         interactivity: ['cartodb_id','partner_s_name', 'url', 'logo', 'url', 'city', 'description', 'country','region']
      },
      {
         type: "mapnik", // layer 4
         sql: 'SELECT * FROM cbd_offices_ds_links',
         cartocss: styleLinks,
         interactivity: ['cartodb_id']
      },
      {
         type: "mapnik", // layer 5
         sql: 'SELECT * FROM cbd_offices_ds',
         cartocss: styleLabels,
         interactivity: ['cartodb_id']
      }
    ]
  })
  .addTo(map) // add cartodb basemap (0) & layers to map object
  .done(function(layer) {

    map.touchZoom.disable(); // disable zoom control
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();

    var sql = new cartodb.SQL({ user: 'ramirocartodb'}); // call SQL API

    var centEmea = [50, 10]; // set centroids for each region
    var centNa = [50, -100];
    var centApac = [5, 150];
    var centLatam = [-15, -50];
    
    var LayerActions = { // get sublayers by region
    emea: function(){
       layer.getSubLayer(3).setSQL(sql_partners.replace('yOffset', zoom4_yOffset) + sql_emea);
        map.setView(centEmea,4);
        return true;
    },
    na: function(){
       layer.getSubLayer(3).setSQL(sql_partners.replace('yOffset', zoom4_yOffset) + sql_na); 
        map.setView(centNa,4);
        return true;
    },
    latam: function(){
        layer.getSubLayer(3).setSQL(sql_partners.replace('yOffset', zoom4_yOffset) + sql_latam);
        map.setView(centLatam,4);
        return true;
    },
    apac: function(){
        layer.getSubLayer(3).setSQL(sql_partners.replace('yOffset', zoom4_yOffset) + sql_apac);
        map.setView(centApac,4);
    },
    all: function(){
        layer.getSubLayer(3).setSQL(sql_partners.replace('yOffset', zoom3_yOffset));
        map.setView([30, -45],3);
      }
    }  

    $('#layer_selector').change(function() { // set button interaction
      LayerActions[$(this).val()]();
    });
    
    layer.setInteraction(true);

    cdb.vis.Vis.addInfowindow( // add infowindow
      map, layer.getSubLayer(3), ['partner_s_name','url', 'city', 'country', 'region', 'logo', 'description'],
        {
          infowindowTemplate: $('#infowindow_template').html()
        });
 
    var tooltip = layer.leafletMap.viz.addOverlay({ // add tooltip
      type: 'tooltip',
      layer: layer.getSubLayer(3),
      template: "<div class='cartodb-tooltip-content-wrapper'><div class='cartodb-tooltip-content'><div class='CDB-Tooltip-wrapper CDB-Tooltip-wrapper--topLeft'><div class='CDB-Tooltip CDB-Tooltip--isLight'><ul class='CDB-Tooltip-list'><li class='CDB-Tooltip-listItem'><h3 class='CDB-Tooltip-listTitle'>{{city}}</h3><h4 class='CDB-Tooltip-listText'>{{partner_s_name}}</h4></li></ul></div></div></div>", 
      width: 200,
      position: 'bottom|right',
      fields: [{ city: 'city' }, { partner_s_name: 'name' }]
    });
    $('body').append(tooltip.render().el);

    });
  }
window.onload = main;