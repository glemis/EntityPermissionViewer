import {IInputs, IOutputs} from "./generated/ManifestTypes";
import DataSetInterfaces = ComponentFramework.PropertyHelper.DataSetApi;
import * as Vis from 'vis';
import { triggerAsyncId } from "async_hooks";

type DataSet = ComponentFramework.PropertyTypes.DataSet;
// interface Node {
// 	id: string;
// 	label: string;
// }

// interface Edge {
// 	from: string;
// 	to: string;
// 	label: string;
// }

export class learning1 implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	private nodes:any[];
	private edges:any[];
	private mainContainer: HTMLDivElement;
	private dataWindow: HTMLDivElement;

	private vis:Vis.Network;

	/**
	 * Empty constructor.
	 */
	constructor()
	{
		this.nodes = [];
		this.edges = [];
	}

	/**
	 * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
	 * Data-set values are not initialized here, use updateView.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
	 * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
	 * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
	 * @param container If a control is marked control-type='starndard', it will receive an empty div element within which it can render its content.
	 */
	public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement)
	{
		this.mainContainer = document.createElement("div");
		this.mainContainer.setAttribute("style", "height:600px;");
		container.appendChild(this.mainContainer);

		this.dataWindow = document.createElement("div");
		this.dataWindow.setAttribute("class", "nodeDetails");

		container.appendChild(this.dataWindow);

	  //context.webAPI.retrieveMultipleRecords("adx_entitypermission", "?fetchXml="+encodeURIComponent(fetchXml)).then(this.CreateNodes, function (errorResponse: any){});
	}

	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: any): void
	{
		// Add code to update control view
		//let columns = context.parameters.dataSetGrid.columns;
		
		this.createNodes(context.page.entityId,context.parameters.dataSetGrid);
	}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs
	{
		return {};
	}

	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void
	{
		// Add code to cleanup control if necessary
	}

	private createNodes(mainGuid:any,gridParam: DataSet): void
	{
		console.debug("Create Nodes");
		console.debug(gridParam.sortedRecordIds);
		for (let currentRecordId  of gridParam.sortedRecordIds) 
		{
			let record1id = gridParam.records[currentRecordId].getRecordId();
			let record1name = gridParam.records[currentRecordId].getValue("adx_entitylogicalname");

				if (this.nodes.find(e => e.id === record1id) === undefined) {
					var node = {
						id: record1id, 
						label: record1name,
						scope: (gridParam.records[currentRecordId].getFormattedValue("adx_scope") as any),
						read: (gridParam.records[currentRecordId].getFormattedValue("adx_read") as any),
						write: (gridParam.records[currentRecordId].getFormattedValue("adx_write") as any),
						create: (gridParam.records[currentRecordId].getFormattedValue("adx_create") as any),
						delete:(gridParam.records[currentRecordId].getFormattedValue("adx_delete") as any),
						append: (gridParam.records[currentRecordId].getFormattedValue("adx_append") as any),
						appendTo: (gridParam.records[currentRecordId].getFormattedValue("adx_appendto") as any),
						name: (gridParam.records[currentRecordId].getValue("adx_entityname") as any),
						color:{}
					};
					if(currentRecordId == mainGuid){
						node.color = {
							border: "#94620e",
							background: "#e1a33d",
							hover: {
							  border: "#e1a33d",
							  background: "#f7c572"
							},
							highlight: {
								border: "#e1a33d",
								background: "#f7c572"
							  }
						}
					}
					this.nodes.push(node);
			}
		}
		console.debug("Nodes");
		console.debug(this.nodes);
		try{
			for (let currentRecordId  of gridParam.sortedRecordIds) 
			{
				let record1id = gridParam.records[currentRecordId].getRecordId();
				let record2rolename = (gridParam.records[currentRecordId].getValue("adx_parentrelationship") as any);
				let scope = (gridParam.records[currentRecordId].getFormattedValue("adx_scope") as any);
				if(scope == "Self"){
					if (this.edges.find( e=> e.to === record1id && e.from === record1id && e.relationship === "self") === undefined) {
						this.edges.push({
							from: record1id,
							to: record1id,
							relationship: "self",
							weight:1,
						});
					} 
				}else if(scope == "Parent"){
					let record2id = (gridParam.records[currentRecordId].getValue("adx_parententitypermission") as any).id.guid;
					if (this.edges.find( e=> e.to == record2id && e.from == record1id && e.relationship == record2rolename) === undefined) {
						this.edges.push({
							from: record1id,
							to: record2id,
							relationship: record2rolename,
							weight:1
						});
					}    
				}
				else if(scope == "Global"){
					if(this.nodes.find(e=> e.id == "Global") == null){
						this.nodes.push({
							id: "Global", 
							label: "Global"
						});
					}
					if (this.edges.find( e=> e.from == record1id && e.to == "Global" && e.relationship == "Global") === undefined) {
						this.edges.push({
							from: record1id,
							to: "Global",
							relationship: "global"
						});
					} 
				}
			}
		}catch(ex){
			console.debug("Error");
			console.debug(ex);
		}
		
		console.debug("Edges");
		console.debug(this.edges);
		try{
			let contactNode = this.nodes.find(e=> e.label === "contact" && e.scope == "Self");
			let accountNode = this.nodes.find(e=> e.label === "account" && e.scope == "Self");

			for (let currentRecordId  of gridParam.sortedRecordIds) 
			{
				let record1id = gridParam.records[currentRecordId].getRecordId();
				let scope = (gridParam.records[currentRecordId].getValue("adx_scope") as any);
				if(scope == "Contact" && contactNode != null){
					let relation =(gridParam.records[currentRecordId].getValue("adx_contactrelationship") as any);
					if (this.edges.find( e=> e.from == record1id && e.to == contactNode.Id && e.relationship == relation) === undefined) {
						this.edges.push({
							from: record1id,
							to: contactNode.Id,
							relationship: relation
						});
					}  
				}else if(scope == "Account" && accountNode != null){
					let relation =(gridParam.records[currentRecordId].getValue("adx_accountrelationship") as any);
					if (this.edges.find( e=> e.from == record1id && e.to == accountNode.Id && e.relationship == relation) === undefined) {
						this.edges.push({
							from: record1id,
							to: accountNode.Id,
							relationship: relation
						});
					} 
				}
			}
			
		}catch(ex){
			console.debug("Error");
			console.debug(ex);
		}
		console.debug("Create Network");
		this.vis = new Vis.Network(this.mainContainer, { nodes: this.nodes, edges: this.edges}, 
			{
				"layout":{"randomSeed":2},
				"nodes":{"fixed":{"x":false,"y":false},"shape":"dot","size":13,"borderWidth":1.5,"borderWidthSelected":2,"font":{"size":17,"align":"center"}},
				"edges":{"width":2,"color":{"color":"#D3D3D3","highlight":"#797979","hover":"#797979","opacity":1},"arrows":{"from":{"enabled":true,"scaleFactor":1.5,"type":"arrow"}}},
				"physics":{"enabled":true,"barnesHut":{"gravitationalConstant":-30000,"centralGravity":1,"springLength":70,"avoidOverlap":1},"stabilization":{"enabled":true,"iterations":2500}},
				"interaction":{"hover":true,"hoverConnectedEdges":true,"selectable":true,"selectConnectedEdges":false,"zoomView":true,"dragView":false,"navigationButtons":true,"dragNodes":false}
			});

		console.debug("Add on click");
		this.vis.on( 'click',(properties) => this.showNodesDetails(properties));
	}

	private showNodesDetails(properties:any) : void
	{
		console.debug("Show Details");
		var clickedNodes = this.nodes.filter(e => properties.nodes.indexOf(e.id) != -1);
		console.debug(clickedNodes);
		this.dataWindow.innerHTML = "";
		clickedNodes.forEach(element => {
		  console.debug(element);
		  this.dataWindow.innerHTML += 
		  `<div>
		  	<div><a href="#" onclick="Xrm.Utility.openEntityForm('adx_entitypermission','${element.id}');">Navigate to record</a></div>
			<div>Name: ${element.name}</div>
			<div>Logical Name: ${element.label}</div>
			<div>Scope: ${element.scope}</div>	
			<table class="permissions">
				<thead>
					<th>C</th>
					<th>R</th>
					<th>U</th>
					<th>D</th>
					<th>A</th>
					<th>AT</th>
				</thead>
				<tbody>
					<td>${element.create}</td>
					<td>${element.read}</td>
					<td>${element.write}</td>
					<td>${element.delete}</td>
					<td>${element.append}</td>
					<td>${element.appendTo}</td>
				</tbody>
			</table>
		  </div>`;
		});
		if(clickedNodes.length == 0){
		  var clickedEdges = this.edges.filter(e => properties.edges.indexOf(e.id) != -1);
		  this.dataWindow.innerHTML += 
				`<div style="border-bottom:1px solid">
					<div>Edge: ${clickedEdges[0].relationship}</div>
				</div>`;
		}
	}
}