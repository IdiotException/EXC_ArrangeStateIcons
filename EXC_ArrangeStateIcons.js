//=============================================================================
// 戦闘画面ステータスアイコン表示展開プラグイン
// EXC_ArrangeStateIcons.js
// ----------------------------------------------------------------------------
// Copyright (c) 2024 IdiotException
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.0.0 2024-07-25
//=============================================================================
/*:
 * @target MZ
 * @plugindesc 戦闘画面でステータスアイコンを並べて表示します
 * @author IdiotException
 * @url https://github.com/IdiotException/EXC_ArrangeStateIcons
 * @help 戦闘画面でステータスアイコンを並べて表示します
 * 
 * アイコンの表示・非表示を透過率で処理しているため、
 * ステータスアイコンの透過率をいじるようなプラグインとは相性が良くないです。
 * 
 * 利用規約
 *   MITライセンスです。
 *   作者に無断で改変、再配布が可能で、
 *   利用形態（商用、18禁利用等）についても制限はありません。
 * 
 * 
 * @param ChangeSpan
 * @text 切り替わりフレーム
 * @desc ページ切り替えフレーム数
 * @type number
 * @default 80
 * @decimals 0
 * @min 0
 * 
 * @param OffsetX
 * @text 横方向ずらし量
 * @desc 本来のステータスアイコン位置から横方向のずらす量
 * 正であれば右に、負であれば左に移動する
 * @type number
 * @default -105
 * @decimals 0
 * @min -9999
 * 
 * @param OffsetY
 * @text 縦方向ずらし量
 * @desc 本来のステータスアイコン位置から縦方向のずらす量
 * 正であれば下に、負であれば上に移動する
 * @type number
 * @default -2
 * @decimals 0
 * @min -9999
 * 
 * @param Padding
 * @text アイコン間距離
 * @desc アイコンが並んだ場合のアイコン間の距離
 * @type number
 * @default 2
 * @decimals 0
 * @min -9999
 * 
 * @param RowMax
 * @text 最大行数
 * @desc アイコンの最大行数
 * @type number
 * @default 3
 * @decimals 0
 * @min 0
 * 
 * @param ColumnMax
 * @text 最大列数
 * @desc アイコンの最大列数
 * @type number
 * @default 4
 * @decimals 0
 * @min 0
 * 
 * @param DefaultOpacity
 * @text アイコン透過率
 * @desc アイコンの透過率
 * @type number
 * @default 255
 * @max 255
 * @min 0
 * @decimals 0
 * 
 * @param RowAlign
 * @text 行方向
 * @desc 行の伸びる方向
 * @type combo
 * @option 上
 * @option 下
 * @default 下
 * 
 * @param ColumnAlign
 * @text 列方向
 * @desc 列の伸びる方向
 * @type combo
 * @option 左
 * @option 右
 * @default 右
 * 
 * @param IconsAlign
 * @text 並ぶ方向
 * @desc アイコンの並ぶ方向
 * @type combo
 * @option 縦
 * @option 横
 * @default 横
 */
const EXCArrangeStateIcons = document.currentScript.src.match(/^.*\/(.+)\.js$/)[1];

(function() {
	"use strict";

	//パラメータ受取処理
	const parameters = PluginManager.parameters(EXCArrangeStateIcons);
	const _changeSpan 		= Number(parameters['ChangeSpan'] || 0);
	const _offsetX 			= Number(parameters['OffsetX'] || 0);
	const _offsetY 			= Number(parameters['OffsetY'] || 0);
	const _padding 			= Number(parameters['Padding'] || 0);
	const _rowMax 			= Number(parameters['RowMax'] || 1);
	const _colMax 			= Number(parameters['ColumnMax'] || 1);
	const _maxIcons 		= _rowMax * _colMax;
	const _defaultOpacity 	= Number(parameters['DefaultOpacity'] || 255);
	const _rowAlign 		= String(parameters['RowAlign'] || "下");
	const _colAlign 		= String(parameters['ColumnAlign'] || "右");
	const _iconsAlign 		= String(parameters['IconsAlign'] || "縦");

	//--------------------------------------------------
	// Window_BattleStatus のオーバーライド
	//--------------------------------------------------
	// 表示用スプライトの追加
	const _EXC_Window_BattleStatus_placeStateIcon = Window_BattleStatus.prototype.placeStateIcon;
	Window_BattleStatus.prototype.placeStateIcon = function(actor, x, y) {
		_EXC_Window_BattleStatus_placeStateIcon.call(this, ...arguments);
		
		// 元スプライトのキーを作成
		const key = "actor%1-stateIcon".format(actor.actorId());
		// キーをもとに呼び出して非表示
		this._additionalSprites[key].hide();

		let outerMax = 0;
		let innerMax = 0;

		// 並び方向の設定
		if(_iconsAlign == "縦"){
			outerMax = _colMax;
			innerMax = _rowMax;
		} else {
			outerMax = _rowMax;
			innerMax = _colMax;
		}

		// 並べて表示するアイコンのSpriteを作成
		this._stateIconChildren = [];
		for(let i = 0; i < outerMax; i++){
			for(let j = 0; j < innerMax; j++){
				// 各設定値を作成
				const tmpKey = key + "_" + this._stateIconChildren.length;
				
				let xCount = 0;
				let yCount = 0;
		
				// 並び方向の設定
				if(_iconsAlign == "縦"){
					xCount = i;
					yCount = j;
				} else {
					xCount = j;
					yCount = i;
				}

				// X方向の決定
				let xPosNeg = 1;
				if(_colAlign == "左"){
					xPosNeg = -1;
				}

				// Y方向の決定
				let yPosNeg = 1;
				if(_rowAlign == "上"){
					yPosNeg = -1;
				}
				// アイコン位置計算
				const tmpX = x  + _offsetX + ((ImageManager.iconWidth + _padding) * xCount * xPosNeg);
				const tmpY = y  + _offsetY + ((ImageManager.iconHeight + _padding) * yCount * yPosNeg);

				// スプライトの作成と設定
				const tmpSprite = this.createInnerSprite(tmpKey, Sprite_StateIconChild);
				tmpSprite.setup(actor);
				tmpSprite.move(tmpX, tmpY);
				tmpSprite.show();
				tmpSprite.setIndex(this._stateIconChildren.length);
				this._stateIconChildren.push(tmpSprite);
			}
		}
	};

	//-----------------------------------------------------------------------------
	// Sprite_StateIconChild
	//
	// 並ぶステータスアイコン用
	// Sprite_StateIconをもとにしているのでそちらに影響があるプラグインの影響も受ける

	function Sprite_StateIconChild() {
		this.initialize(...arguments);
	}

	Sprite_StateIconChild.prototype = Object.create(Sprite_StateIcon.prototype);
	Sprite_StateIconChild.prototype.constructor = Sprite_StateIconChild;

	Sprite_StateIconChild.prototype.initialize = function(rect) {
		Sprite_StateIcon.prototype.initialize.call(this, rect);
	};

	// 追加したものの初期化を追加
	const _EXC_Sprite_StateIconChild_initMembers = Sprite_StateIconChild.prototype.initMembers;
	Sprite_StateIconChild.prototype.initMembers = function() {
		_EXC_Sprite_StateIconChild_initMembers.call(this);
		this._index = -1;
		this._pageIndex = 0;
	};

	// 切り替わり時間の設定
	Sprite_StateIconChild.prototype.animationWait = function() {
		return _changeSpan;
	};

	// アイコン切り替わりの処理
	const _EXC_Sprite_StateIconChild_updateIcon = Sprite_StateIconChild.prototype.updateIcon;
	Sprite_StateIconChild.prototype.updateIcon = function() {
		// iconsのセットあたりは元処理からコピー
		const icons = [];
		if (this.shouldDisplay()) {
			icons.push(...this._battler.allIcons());
		}
		if (icons.length > 0) {
			// このアイコン表示オブジェクトが表示するインデックスを計算
			const tmpIndex = this._index + _maxIcons * this._pageIndex;

			// ページ内で対象位置に表示するアイコンがあるか
			if(tmpIndex < icons.length){
				// 透過率をいじって表示・非表示を制御
				// show,hideだと意図しないときにshowされるパターンがあったため
				// 具体的にはキャラクターが倒れた直後の処理で表示されてしまうパターンがあった
				this.opacity = _defaultOpacity;

				// 表示するアイコンのインデックスを設定(表示前に一個ずれるので１引いておく)
				this._animationIndex = tmpIndex - 1;
				_EXC_Sprite_StateIconChild_updateIcon.call(this);
			} else {
				// 表示するアイコンがない場合の処理
				// 透過率をいじって表示・非表示を制御
				this.opacity = 0;
			}

			// 次ページのセット
			this._pageIndex++;
			if (this._pageIndex >= Math.ceil(icons.length / _maxIcons)) {
				// 表示するものがなくなるページになる場合、ページを最初に戻す
				this._pageIndex = 0;
			}
		} else {
			// 元の処理呼び出し（初期化処理に流れるはず）
			_EXC_Sprite_StateIconChild_updateIcon.call(this);

			// 初期化
			this._pageIndex = 0;
		}
	};

	// 追加関数
	// 自分が何番目かセットしておく
	Sprite_StateIconChild.prototype.setIndex = function(index) {
		this._index = index;
	};
})();

