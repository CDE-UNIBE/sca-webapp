<?php

/**
 * Static content controller.
 *
 * This file will render views from views/pages/
 *
 * CakePHP(tm) : Rapid Development Framework (http://cakephp.org)
 * Copyright (c) Cake Software Foundation, Inc. (http://cakefoundation.org)
 *
 * Licensed under The MIT License
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Cake Software Foundation, Inc. (http://cakefoundation.org)
 * @link          http://cakephp.org CakePHP(tm) Project
 * @package       app.Controller
 * @since         CakePHP(tm) v 0.2.9
 * @license       http://www.opensource.org/licenses/mit-license.php MIT License
 */
App::uses('AppController', 'Controller');
App::uses('HttpSocket', 'Network/Http');

/**
 * Static content controller
 *
 * Override this controller by placing a copy in controllers directory of an application
 *
 * @package       app.Controller
 * @link http://book.cakephp.org/2.0/en/controllers/pages-controller.html
 */
class WpsController extends AppController {

    /**
     * This controller does not use a model
     *
     * @var array
     */
    public $uses = array();

    /**
     * Displays a view
     *
     * @param mixed What page to display
     * @return void
     * @throws NotFoundException When the view file could not be found
     * 	or MissingViewException in debug mode.
     */
    public function index() {
        $this->layout = "json";
        $this->response->type("application/json");

        //http://localhost/devel/sca-webapp/wps.json?Version=1.0.0&DataInputs=lon=35.848388671875;lat=-6.0968598188879355;epsg=4326&Service=WPS&RawDataOutput=bufferstatistics@mimeType=application/json&ServiceProvider=&metapath=&Identifier=BufferStatistics2&Request=Execute

        $HttpSocket = new HttpSocket();

        // array query
        $results = $HttpSocket->get('http://zoo.cdesdi.cde.unibe.ch/zoo_loader.cgi', $this->request->query);

        $this->set("data", json_decode($results->body));
    }

}
