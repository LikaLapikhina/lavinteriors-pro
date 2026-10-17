(async () => {
  let targetWin = window;
  if (!targetWin.HSApp || !targetWin.HSApp.App) {
    const iframes = Array.from(document.querySelectorAll('iframe'));
    for (const ifr of iframes) {
      try {
        if (ifr.contentWindow && ifr.contentWindow.HSApp && ifr.contentWindow.HSApp.App) {
          targetWin = ifr.contentWindow;
          break;
        }
      } catch (e) {}
    }
  }
  if (!targetWin.HSApp || !targetWin.HSApp.App) {
    alert('Откройте 3D-сцену (проект) в Homestyler и нажмите на закладку «⚡ 3DSky Панель» ещё раз!');
    return;
  }
  const app = targetWin.HSApp.App.getApp();
  const HSCore = targetWin.HSCore;
  const T3D = targetWin.T3D;
  const SERVER_ORIGIN = 'http://127.0.0.1:3033';

  // ============================================================================
  // TASK 1: SMART VIEWPORT MATERIALS ENGINE (MIRROR, LIGHT/LED, CLEAR & FLUTED GLASS)
  // ============================================================================
  const SMART_SPECS = {
    smart_mat_mirror: {
      code: 9001.0,
      seekId: 'smart_mat_mirror',
      realSeekId: '27a2024b-f46b-4c3e-8491-236c7a55990e',
      name: '🪞 2D - Зеркало (Реальное отражение)',
      shortName: '🪞 Зеркало',
      badgeBg: ['#cbd5e1', '#f8fafc', '#94a3b8'],
      color: 0xe2e8f0,
      opacity: 1.0,
      transparent: false
    },
    smart_mat_light_warm: {
      code: 9002.0,
      seekId: 'smart_mat_light_warm',
      realSeekId: '5d954745-a824-4528-8981-1458fb8fa4f5',
      name: '💡 2D - Свет Тёплый (Подсветка)',
      shortName: '💡 Свет Тёплый',
      badgeBg: ['#fef3c7', '#fde68a', '#f59e0b'],
      color: 0xf5e3be,
      lightRgb: [0.95, 0.86, 0.70],
      intensity: 0.0,
      opacity: 1.0,
      transparent: false
    },
    smart_mat_light_neutral: {
      code: 9003.0,
      seekId: 'smart_mat_light_neutral',
      realSeekId: '17d47a1f-05bd-4855-83c6-9d6284c19760',
      name: '🔆 2D - Свет Нейтральный (Подсветка)',
      shortName: '🔆 Свет Нейтр.',
      badgeBg: ['#e0f2fe', '#f0f9ff', '#38bdf8'],
      color: 0xf2f6fc,
      lightRgb: [0.93, 0.96, 1.0],
      intensity: 0.0,
      opacity: 1.0,
      transparent: false
    },
    smart_mat_glass_clear: {
      code: 9004.0,
      seekId: 'smart_mat_glass_clear',
      realSeekId: '1f9ddc12-654b-4067-8f13-eb82ba008198',
      name: '🥂 2D - Стекло Прозрачное',
      shortName: '🥂 Стекло Прозр.',
      badgeBg: ['#dbeafe', '#eff6ff', '#60a5fa'],
      color: 0xdbeafe,
      opacity: 0.22,
      transparent: true
    },
    smart_mat_glass_fluted: {
      code: 9005.0,
      seekId: 'smart_mat_glass_fluted',
      realSeekId: 'cc667d16-6216-4154-a6a9-f45d3f53b258',
      name: '🪟 2D - Стекло Рифлёное',
      shortName: '🪟 Стекло Рифл.',
      badgeBg: ['#e0e7ff', '#eef2ff', '#818cf8'],
      color: 0xdbeafe,
      opacity: 0.28,
      transparent: true
    },
    smart_mat_glass_tinted: {
      code: 9006.0,
      seekId: 'smart_mat_glass_tinted',
      name: '🍷 Стекло Цветное (3dsky)',
      shortName: '🍷 Стекло Цвет.',
      color: 0xffffff,
      opacity: 0.48,
      transparent: true
    }
  };

  const CODE_TO_SPEC = {};
  const REAL_SEEKID_TO_SPEC = {};
  Object.values(SMART_SPECS).forEach(s => {
    CODE_TO_SPEC[s.code] = s;
    if (s.realSeekId) {
      SMART_SPECS[s.realSeekId] = s;
      REAL_SEEKID_TO_SPEC[s.realSeekId] = s;
    }
  });

  // Also map all existing 2D Mirror / Light / Glass materials from user's Favorites ('2D - Спецматериалы', '2D - Свет', '2D - Стекло')
  const EXTRA_FAV_SEEKID_TO_CODE = {
    // Mirrors (9001.0)
    '27a2024b-f46b-4c3e-8491-236c7a55990e': 9001.0,
    '6b508a83-0cd3-46f1-b0e5-758de4b8e6a6': 9001.0,
    'f76b1a83-e282-422b-a29b-7b31941a6d17': 9001.0,
    '0a637e74-536c-4ec3-ab91-6b9c3d38db2a': 9001.0,
    'd47f4880-c18c-43e2-a31f-f24550dcdbe7': 9001.0,
    'd5fb9ca0-b08e-47c3-85cb-138c229eef34': 9001.0,
    '22b6a4d1-0b07-47c4-b29a-c39af84d641b': 9001.0,
    'b11245e4-7546-4f6f-a081-fb073f6b698c': 9001.0,
    'f7c55a32-9472-4f63-ab20-b0ab202a6057': 9001.0,
    '89c13275-dc2b-4cdb-a8e2-fcd72e602e81': 9001.0,
    'dc2b327a-c07d-4b47-93ec-61e7005b66f2': 9001.0,
    '00a12e38-ea72-40a9-a8c7-ef8946e63d2b': 9001.0,
    'b96f8045-2a39-4323-91f9-a06d88c08d7c': 9001.0,
    '654080df-e81d-4c29-b900-3464f5c7626c': 9001.0,
    'efca9ec0-71a7-4962-a2bd-4c11caf0b58b': 9001.0,
    '463d0662-b9b5-4378-86b5-c3449c92e5f3': 9001.0,
    // Warm Light (9002.0)
    '5d954745-a824-4528-8981-1458fb8fa4f5': 9002.0,
    'efca9021-a8cf-4668-b30b-83880eeba500': 9002.0,
    '7cf616d3-c3eb-4cc2-8d20-82a90a6a1154': 9002.0,
    // Neutral Light (9003.0)
    '17d47a1f-05bd-4855-83c6-9d6284c19760': 9003.0,
    'dc12692b-af62-4824-95bc-954ca7b9e602': 9003.0,
    // Clear Glass (9004.0)
    '1f9ddc12-654b-4067-8f13-eb82ba008198': 9004.0,
    // Fluted / Frosted Glass (9005.0)
    'cc667d16-6216-4154-a6a9-f45d3f53b258': 9005.0,
    '239015b0-09ce-4e56-a01b-a458d991d72c': 9005.0,
    'd8711149-eeb4-4b8d-95bc-d391a719939a': 9005.0,
    '8e74f28b-cbb0-4ab6-86fa-744b136fb810': 9005.0,
    '8efb0926-c148-40fd-90f6-ac197016a90b': 9005.0,
    '1ac6e584-930c-4cc8-8d8c-ef948e0840d7': 9005.0,
    '86961ced-15ae-4cde-af81-44a2eb31b2e9': 9005.0,
    'f402f48e-c609-4e70-9188-55100d1564b4': 9005.0,
    '070a4e1c-a7a0-407c-b143-7943d075e7c1': 9005.0,
    '589edb79-4fa4-4f6f-9e98-f82aef6d8db0': 9005.0
  };
  for (const [sid, code] of Object.entries(EXTRA_FAV_SEEKID_TO_CODE)) {
    if (!SMART_SPECS[sid] && CODE_TO_SPEC[code]) {
      SMART_SPECS[sid] = CODE_TO_SPEC[code];
    }
  }

  const detectSmartSpecFromSeekOrUrl = (seekId, texUrl) => {
    if (seekId && SMART_SPECS[seekId]) return SMART_SPECS[seekId];
    if (texUrl && typeof texUrl === 'string') {
      for (const [sid, code] of Object.entries(EXTRA_FAV_SEEKID_TO_CODE)) {
        if (texUrl.includes(sid)) return CODE_TO_SPEC[code] || null;
      }
    }
    return null;
  };

  const smartPaintedRegistry = window.__smartPaintedRegistry || (window.__smartPaintedRegistry = new Map());

  const collectNodeMcs = (rootNode) => {
    const list = [];
    if (!rootNode) return list;
    const visit = (n) => {
      if (!n) return;
      const nm = String(n.mName || (n.getName && n.getName()) || '');
      if (nm.includes('_outline') || nm.includes('outline') || nm.includes('wireframe') || nm.includes('edgeLine')) return;
      const comps = n.mComponentsList || n.mComponents;
      if (Array.isArray(comps)) {
        for (let i = 0; i < comps.length; i++) {
          const c = comps[i];
          if (c && c instanceof T3D.MeshComponent) list.push(c);
        }
      }
      const ch = n.mChildren;
      if (Array.isArray(ch)) {
        for (let i = 0; i < ch.length; i++) visit(ch[i]);
      }
    };
    visit(rootNode);
    return list;
  };

  const setOutlineNodesVisible = (ownerNode, visible) => {
    if (!ownerNode) return;
    const checkNode = (n) => {
      if (!n) return;
      const nm = String(n.mName || (n.getName && n.getName()) || '');
      if (nm.includes('_outline') || nm.includes('outline') || nm.includes('wireframe')) {
        if (n.setVisible) n.setVisible(visible);
        n.mVisible = visible;
      }
    };
    checkNode(ownerNode);
    if (ownerNode.mParent) {
      const siblings = ownerNode.mParent.mChildren || [];
      const baseName = String(ownerNode.mName || '');
      siblings.forEach(sib => {
        const sn = String(sib.mName || '');
        if (sn === baseName + '_outline' || (baseName && sn.startsWith(baseName) && sn.includes('outline'))) {
          if (sib.setVisible) sib.setVisible(visible);
          sib.mVisible = visible;
        }
      });
    }
  };

  const smartHistoryStack = window.__smartHistoryStack || (window.__smartHistoryStack = []);

  const applySmartCodeToT3dMaterial = (mat, code) => {
    if (!mat) return;
    const spec = CODE_TO_SPEC[code];
    if (!spec) {
      const origShin = (mat._origShininess != null && mat._origShininess < 8999.0) ? mat._origShininess : 32.0;
      if (mat.setFloatParameter) mat.setFloatParameter('Shininess', origShin);
      if (mat.setShininess) mat.setShininess(origShin);
      mat.mShininess = origShin;
      const origOp = mat._origOpacity != null ? mat._origOpacity : 1.0;
      if (mat.setOpacity) mat.setOpacity(origOp);
      mat.mOpacity = origOp;
      if (mat._origColor != null) {
        if (mat.setColor) mat.setColor(mat._origColor);
        mat.mColor = mat._origColor;
      }
      if (mat._origTransparent != null) {
        if (mat.setTransparent) mat.setTransparent(mat._origTransparent);
        mat.transparent = mat._origTransparent;
      }
      if (mat._origBlendMode != null && mat.setBlendMode) mat.setBlendMode(mat._origBlendMode);
      mat._smartSpec = null;
      mat._smartType = 0;
      return;
    }
    if (mat._origShininess == null || mat._origShininess > 8999.0) {
      mat._origShininess = (mat.mShininess != null && mat.mShininess < 8999.0) ? mat.mShininess : 32.0;
    }
    if (mat._origOpacity == null) mat._origOpacity = mat.mOpacity != null ? mat.mOpacity : 1.0;
    if (mat._origColor == null && mat.mColor != null) mat._origColor = mat.mColor;
    if (mat._origTransparent == null) mat._origTransparent = !!mat.transparent;
    if (mat._origBlendMode == null && mat.getBlendMode) mat._origBlendMode = mat.getBlendMode();

    mat._smartSpec = spec;
    mat._smartType = spec.code;
    if (mat.setFloatParameter) mat.setFloatParameter('Shininess', spec.code);
    if (mat.setShininess) mat.setShininess(spec.code);
    mat.mShininess = spec.code;

    if (spec.transparent) {
      if (mat.setTransparent) mat.setTransparent(true);
      mat.transparent = true;
      if (mat.setOpacity) mat.setOpacity(spec.opacity);
      mat.mOpacity = spec.opacity;
      if (mat.setBlendMode && T3D.MaterialBlendMode) {
        mat.setBlendMode(T3D.MaterialBlendMode.BM_TRANSPARENT);
      } else if (mat.setBlendMode && T3D.BlendMode) {
        mat.setBlendMode(T3D.BlendMode.BM_TRANSPARENT);
      }
      if (mat.setCullMode && T3D.RasterizerCullMode) {
        mat.setCullMode(T3D.RasterizerCullMode.CM_None);
      }
    } else {
      if (mat.setTransparent) mat.setTransparent(false);
      mat.transparent = false;
      if (mat.setOpacity) mat.setOpacity(1.0);
      mat.mOpacity = 1.0;
      if (mat.setBlendMode && T3D.MaterialBlendMode) {
        mat.setBlendMode(T3D.MaterialBlendMode.BM_NONE);
      }
    }
  };

  const applySmartSpecToMeshComponent = (mc, specOrNull, entityId, skipHistory = false) => {
    if (!mc) return;
    let mat = mc.getMaterial && mc.getMaterial();
    if (!mat) return;
    const prevSpec = mc._smartSpec || (mat && mat._smartSpec) || CODE_TO_SPEC[mc._smartType || (mat && mat._smartType)] || null;
    const code = specOrNull ? specOrNull.code : 0;

    if (!skipHistory && prevSpec !== specOrNull) {
      smartHistoryStack.push({ mc, prevSpec: prevSpec || null, newSpec: specOrNull || null, entityId, ts: Date.now() });
      if (smartHistoryStack.length > 60) smartHistoryStack.shift();
    }

    // Always use a clean untextured MeshPhongMaterial for smart materials so Material_Shininess is 100% active in the shader, and restore _origNonPhongMat on reset
    if (specOrNull && !mat._isSmartPhongMat) {
      if (!mc._origNonPhongMat) mc._origNonPhongMat = mat;
      const phongMat = new T3D.MeshPhongMaterial({
        color: specOrNull.color || 0xffffff,
        opacity: specOrNull.opacity != null ? specOrNull.opacity : 1.0,
        transparent: !!specOrNull.transparent
      });
      phongMat._isSmartPhongMat = true;
      if (phongMat.setCullMode && T3D.RasterizerCullMode) {
        phongMat.setCullMode(T3D.RasterizerCullMode.CM_None);
      }
      if (mc._origSetMaterial) mc._origSetMaterial(phongMat);
      else if (mc.setMaterial) mc.setMaterial(phongMat);
      mat = phongMat;
    } else if (!specOrNull && mc._origNonPhongMat) {
      applySmartCodeToT3dMaterial(mat, 0);
      if (mc._origSetMaterial) mc._origSetMaterial(mc._origNonPhongMat);
      else if (mc.setMaterial) mc.setMaterial(mc._origNonPhongMat);
      mat = mc._origNonPhongMat;
      mc._origNonPhongMat = null;
    }

    mc.isShadow = !!specOrNull; // exclude from outline postprocess when smart material is active
    mc._smartSpec = specOrNull || null;
    mc._smartType = code;
    mc._smartClearedByUser = !specOrNull;
    applySmartCodeToT3dMaterial(mat, code);
    const nodeName = mc.mOwnerNode ? mc.mOwnerNode.mName : '';
    if (mc.mOwnerNode) {
      setOutlineNodesVisible(mc.mOwnerNode, !specOrNull);
    }
    const bb = mc.mOwnerNode && mc.mOwnerNode.getWorldBoundingBox && mc.mOwnerNode.getWorldBoundingBox();
    const savedBb = (bb && bb.min && bb.max && isFinite(bb.min.x))
      ? { min: [bb.min.x, bb.min.y, bb.min.z], max: [bb.max.x, bb.max.y, bb.max.z] }
      : null;
    const key = (entityId || 'ent') + '::' + (nodeName || (mc.getRuntimeID ? mc.getRuntimeID() : '0'));
    if (specOrNull) {
      smartPaintedRegistry.set(key, { mc, spec: specOrNull, entityId, nodeName, savedBb });
    } else {
      smartPaintedRegistry.delete(key);
      // Also delete any other registry entries pointing to this same mc or node
      for (const [rk, rv] of Array.from(smartPaintedRegistry.entries())) {
        if (!rv) {
          smartPaintedRegistry.delete(rk);
          continue;
        }
        if (rv.mc === mc || (entityId && String(rv.entityId) === String(entityId) && (!nodeName || rv.nodeName === nodeName))) {
          smartPaintedRegistry.delete(rk);
        }
      }
    }
    try {
      const ser = [];
      for (const [rk, rv] of smartPaintedRegistry.entries()) {
        if (rv && rv.spec) {
          ser.push({ k: rk, code: rv.spec.code, entityId: rv.entityId, nodeName: rv.nodeName, savedBb: rv.savedBb || null });
        }
      }
      localStorage.setItem('skypro_smart_painted_v1', JSON.stringify(ser));
    } catch (e) {}
    window.__smartSceneCacheDirty = true;
  };

  // Restore persisted smart materials (and default known mirror/light objects if storage is empty)
  try {
    const rawSaved = localStorage.getItem('skypro_smart_painted_v1');
    const savedList = rawSaved ? JSON.parse(rawSaved) : [
      { k: '90454::90454/52', code: 9001, entityId: '90454', nodeName: '90454/52' },
      { k: '90465::90465/48', code: 9002, entityId: '90465', nodeName: '90465/48' },
      { k: '90373::90373/144', code: 9001, entityId: '90373', nodeName: '90373/144' },
      { k: '90374::90374/40', code: 9001, entityId: '90374', nodeName: '90374/40' },
      { k: '90437::90437/60', code: 9001, entityId: '90437', nodeName: '90437/60' }
    ];
    if (Array.isArray(savedList)) {
      for (const item of savedList) {
        if (item && item.k && CODE_TO_SPEC[item.code] && !smartPaintedRegistry.has(item.k)) {
          smartPaintedRegistry.set(item.k, {
            mc: null,
            spec: CODE_TO_SPEC[item.code],
            entityId: item.entityId,
            nodeName: item.nodeName,
            savedBb: item.savedBb || null
          });
        }
      }
    }
  } catch (e) {}

  window.__clearAllSmartMaterialsOnEntity = (entOrId) => {
    const v3d = app.getActive3DView();
    if (!v3d || !v3d.displayList) return false;
    const id = typeof entOrId === 'object' && entOrId ? entOrId.id : entOrId;
    const disp = id != null ? v3d.displayList[id] : null;
    if (disp && disp.entity) {
      const cls = String(disp.entity.Class || disp.entity.constructor.name || '');
      if (/Layer|Scene|CustomizedPMModel$/i.test(cls)) return false;
    }
    let clearedAny = false;
    if (disp && disp.node) {
      const mcs = collectNodeMcs(disp.node);
      mcs.forEach(mc => {
        applySmartSpecToMeshComponent(mc, null, id);
        clearedAny = true;
      });
    }
    for (const [rk, rv] of Array.from(smartPaintedRegistry.entries())) {
      if (rv && String(rv.entityId) === String(id)) {
        if (rv.mc) applySmartSpecToMeshComponent(rv.mc, null, id);
        smartPaintedRegistry.delete(rk);
        clearedAny = true;
      }
    }
    if (disp && disp.dirtyGraph) disp.dirtyGraph();
    if (v3d.renderingMgr) v3d.renderingMgr.needUpdate = true;
    if (v3d.context) v3d.context.needsRendering = true;
    return clearedAny;
  };

  window.__undoLastSmartMaterial = () => {
    const v3d = app.getActive3DView();
    while (smartHistoryStack.length > 0) {
      const last = smartHistoryStack.pop();
      if (last && last.mc) {
        applySmartSpecToMeshComponent(last.mc, last.prevSpec || null, last.entityId, true);
        if (v3d && v3d.renderingMgr) v3d.renderingMgr.needUpdate = true;
        if (v3d && v3d.context) v3d.context.needsRendering = true;
        return last;
      }
    }
    return null;
  };

  // Reset accidentally painted walls, ceilings, panels, and wood slats
  if (!window.__smartCleanedTestObjectsV21) {
    window.__smartCleanedTestObjectsV21 = true;
    window.__smartFlipF = false;
    window.__activeSmartBrushSpec = undefined;
    const accidentalPrefixes = ['29242::', '77829::', '5957::', '83826::', '83765::', '21456::', '18504::', '55928::', '80769::'];
    for (const [k, entry] of Array.from(smartPaintedRegistry.entries())) {
      if (accidentalPrefixes.some(p => k.startsWith(p)) || k === '83834::solid_001' || k === '83834::solid_003') {
        if (entry && entry.mc) {
          applySmartSpecToMeshComponent(entry.mc, null, entry.entityId, true);
        }
        smartPaintedRegistry.delete(k);
      }
    }
    ['83826', '83765', '21456', '18504', '55928'].forEach(id => {
      try { window.__clearAllSmartMaterialsOnEntity(id); } catch (e) {}
    });
  }

  const installSmartViewportShaderEngine = () => {
    const v3d = app.getActive3DView();
    if (!v3d || !v3d.renderingMgr || !v3d.renderingMgr.renderer) return false;
    const r = v3d.renderingMgr.renderer;
    const canvas = v3d._canvasElement || document.querySelectorAll('canvas')[0];
    if (!canvas) return false;
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return false;
    window.__smartActiveGL = gl;

    if (!gl.__smartMirrorTex) {
      gl.__smartMirrorTex = gl.createTexture();
      gl.activeTexture(gl.TEXTURE7);
      gl.bindTexture(gl.TEXTURE_2D, gl.__smartMirrorTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, Math.max(1, canvas.width), Math.max(1, canvas.height), 0, gl.RGB, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.activeTexture(gl.TEXTURE0);
      gl.__smartMirrorW = canvas.width;
      gl.__smartMirrorH = canvas.height;
    }

    if (!gl.__smartState) {
      gl.__smartState = {
        pass: 0,
        plane: new Float32Array([0, 0, 1, 0]),
        camPos: new Float32Array([0, 1.5, 0, 1]),
        vpSize: new Float32Array([canvas.width || 1280, canvas.height || 720, 0, 0]),
        lightMin: new Float32Array(96),
        lightMax: new Float32Array(96),
        lightCol: new Float32Array(96),
        lightCount: 0
      };
    } else {
      if (!gl.__smartState.lightMin || gl.__smartState.lightMin.length < 96) gl.__smartState.lightMin = new Float32Array(96);
      if (!gl.__smartState.lightMax || gl.__smartState.lightMax.length < 96) gl.__smartState.lightMax = new Float32Array(96);
      if (!gl.__smartState.lightCol || gl.__smartState.lightCol.length < 96) gl.__smartState.lightCol = new Float32Array(96);
    }

    const SMART_GLSL_UNIFORMS = `
uniform sampler2D u_SmartMirrorTex;
uniform highp vec4 u_SmartViewportSize;
uniform highp int u_SmartMirrorPass;
uniform highp vec4 u_SmartMirrorPlane;
uniform highp vec4 u_SmartCameraPos;
uniform highp vec4 u_SmartLightMin[24];
uniform highp vec4 u_SmartLightMax[24];
uniform highp vec4 u_SmartLightCol[24];
uniform highp int u_SmartLightCount;
`;

    const bindUBOsAndSamplers = (p, origUse) => {
      const uboMap = { View: 1, Primitive: 2, Material: 3, RenderPipeline: 17, MaterialVS: 19 };
      for (const [bName, bIdx] of Object.entries(uboMap)) {
        const idx = gl.getUniformBlockIndex(p, bName);
        if (idx !== gl.INVALID_INDEX && idx !== 4294967295) {
          gl.uniformBlockBinding(p, idx, bIdx);
        }
      }
      origUse.call(gl, p);
      const diffLoc = gl.getUniformLocation(p, 'DiffuseTexture');
      if (diffLoc !== null) gl.uniform1i(diffLoc, 0);
      const normLoc = gl.getUniformLocation(p, 'NormalTexture');
      if (normLoc !== null) gl.uniform1i(normLoc, 1);
      const mirrLoc = gl.getUniformLocation(p, 'u_SmartMirrorTex');
      if (mirrLoc !== null) gl.uniform1i(mirrLoc, 7);
    };

    const origUseProgram = gl.__origUseProgram || (gl.__origUseProgram = gl.useProgram.bind(gl));

    const ensurePatched = (p) => {
      if (!p || p.__smartV26Patched) return;
      p.__smartV26Patched = true;
      const shaders = gl.getAttachedShaders(p) || [];
      let fs = null;
      for (const s of shaders) {
        if (gl.getShaderParameter(s, gl.SHADER_TYPE) === gl.FRAGMENT_SHADER) fs = s;
      }
      if (!fs) return;
      let rawSrc = p.__origFsSrc || gl.getShaderSource(fs) || '';
      if (rawSrc.includes('u_SmartMirrorPass')) {
        const cut = rawSrc.indexOf('highp vec3 smWorldPos');
        const cutLine = rawSrc.indexOf('if (u_SmartMirrorPass == 1) { discard; }');
        if (cut > 0) {
          const braceStart = rawSrc.lastIndexOf('{', cut);
          rawSrc = rawSrc.slice(0, braceStart).replace(/^uniform[^\n]*u_Smart[^\n]*\n/gm, '').trimEnd() + '\n}\n';
        } else if (cutLine > 0) {
          rawSrc = rawSrc.slice(0, cutLine).replace(/^uniform[^\n]*u_Smart[^\n]*\n/gm, '').trimEnd() + '\n}\n';
        }
      }
      p.__origFsSrc = rawSrc;
      const cleanSrc = rawSrc;

      // 1. Patch CAD edge/outline shaders so mirror reflections never render black wireframe lines
      if (cleanSrc.includes('DashTotalSize') || (!cleanSrc.includes('var_TEXCOORD8') && cleanSrc.includes('var_TEXCOORD4'))) {
        const lastBrace = cleanSrc.lastIndexOf('}');
        if (lastBrace > 0) {
          const lineFs = cleanSrc.slice(0, lastBrace).replace(/precision\s+\w+\s+float\s*;/, (m) => m + '\nuniform highp int u_SmartMirrorPass;\n') + '\n  if (u_SmartMirrorPass == 1) { discard; }\n}\n';
          gl.shaderSource(fs, lineFs);
          gl.compileShader(fs);
          if (gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
            gl.linkProgram(p);
            if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
              gl.shaderSource(fs, cleanSrc);
              gl.compileShader(fs);
              gl.linkProgram(p);
            }
          } else {
            gl.shaderSource(fs, cleanSrc);
            gl.compileShader(fs);
            gl.linkProgram(p);
          }
          bindUBOsAndSamplers(p, origUseProgram);
          p.__uSmartLocs = {
            mirrorTex: null,
            vpSize: null,
            mirrorPass: gl.getUniformLocation(p, 'u_SmartMirrorPass'),
            mirrorPlane: null,
            camPos: null,
            lightCount: null
          };
        }
        return;
      }

      if (!cleanSrc.includes('var_TEXCOORD8')) return;
      const shinVar = cleanSrc.includes('Material_Shininess') ? 'Material_Shininess' : (cleanSrc.includes('Shininess') ? 'Shininess' : '0.0');
      const outVar = cleanSrc.includes('out_Target0') ? 'out_Target0' : (cleanSrc.includes('FragmentOutput_0') ? 'FragmentOutput_0' : null);
      if (!outVar) return;

      const hasNormal = cleanSrc.includes('var_TEXCOORD3_centroid');
      const normExpr = hasNormal
        ? 'normalize(var_TEXCOORD3_centroid.Data.xyz * ((gl_FrontFacing ? 1.0 : -1.0) * Primitive_LocalToWorldDeterminantSign))'
        : 'vec3(0.0, 1.0, 0.0)';

      const injectLogic = `
  {
    highp vec3 smWorldPos = var_TEXCOORD8.Data.xyz;
    highp vec3 smWorldNorm = ${normExpr};
    highp float smShin = ${shinVar};

    if (u_SmartMirrorPass == 1) {
      if (smShin > 9000.5 && smShin < 9001.5) {
        discard;
      }
      if (dot(smWorldPos, u_SmartMirrorPlane.xyz) + u_SmartMirrorPlane.w < 0.008) {
        discard;
      }
    }

    if (smShin < 9000.5 && u_SmartLightCount > 0) {
      highp float maxG = 0.0;
      highp vec3 bestCol = vec3(1.0, 0.955, 0.86);
      highp float bestStrength = 0.38;
      for (int li = 0; li < 24; li++) {
        if (li >= u_SmartLightCount) break;
        highp vec3 bMin = u_SmartLightMin[li].xyz;
        highp vec3 bMax = u_SmartLightMax[li].xyz;
        highp float rad = clamp(u_SmartLightMin[li].w, 0.02, 0.14);
        highp vec3 closestPt = clamp(smWorldPos, bMin, bMax);
        highp float dd = length(closestPt - smWorldPos);
        if (dd < rad) {
          highp float x = clamp(1.0 - dd / rad, 0.0, 1.0);
          highp float g = x * x * (3.0 - 2.0 * x);
          if (g > maxG) {
            maxG = g;
            bestCol = u_SmartLightCol[li].rgb;
            bestStrength = u_SmartLightCol[li].a;
          }
        }
      }
      if (maxG > 0.0) {
        ${outVar} = vec4(clamp(${outVar}.rgb + bestCol * (maxG * bestStrength * (1.0 - ${outVar}.rgb * 0.35)), 0.0, 1.0), ${outVar}.a);
      }
    }

    if (smShin > 9000.5 && smShin < 9001.5) {
      highp vec2 vpSz = max(u_SmartViewportSize.xy, vec2(1.0, 1.0));
      highp vec2 screenUV = gl_FragCoord.xy / vpSz;
      highp vec2 reflUV = vec2(1.0 - screenUV.x, screenUV.y);
      highp vec3 reflCol = texture(u_SmartMirrorTex, clamp(reflUV, 0.002, 0.998)).rgb;
      highp vec3 viewDir = normalize(u_SmartCameraPos.xyz - smWorldPos);
      highp float fresnel = pow(1.0 - clamp(abs(dot(smWorldNorm, viewDir)), 0.0, 1.0), 4.0);
      reflCol = mix(reflCol * vec3(0.985, 0.992, 1.0), vec3(0.94, 0.97, 1.0), fresnel * 0.10);
      ${outVar} = vec4(reflCol, 1.0);
    }
    else if (smShin > 9001.5 && smShin < 9002.5) {
      highp vec3 viewDir = normalize(u_SmartCameraPos.xyz - smWorldPos);
      highp float ndotv = clamp(abs(dot(smWorldNorm, viewDir)), 0.0, 1.0);
      highp float centerFactor = smoothstep(0.0, 0.85, pow(ndotv, 0.52));
      highp vec3 warmCol = mix(vec3(1.0, 0.945, 0.83), vec3(1.0, 0.992, 0.965), centerFactor);
      ${outVar} = vec4(warmCol, 1.0);
    }
    else if (smShin > 9002.5 && smShin < 9003.5) {
      highp vec3 viewDir = normalize(u_SmartCameraPos.xyz - smWorldPos);
      highp float ndotv = clamp(abs(dot(smWorldNorm, viewDir)), 0.0, 1.0);
      highp float centerFactor = smoothstep(0.0, 0.85, pow(ndotv, 0.55));
      highp vec3 neutCol = mix(vec3(0.92, 0.965, 1.0), vec3(0.995, 1.0, 1.0), centerFactor);
      ${outVar} = vec4(neutCol, 1.0);
    }
    else if (smShin > 9003.5 && smShin < 9005.5) {
      highp vec3 viewDir = normalize(u_SmartCameraPos.xyz - smWorldPos);
      highp vec3 N = smWorldNorm;
      highp float ribHighlight = 0.0;
      if (smShin > 9004.5) {
        highp float coord = (abs(N.x) > 0.707) ? smWorldPos.z : smWorldPos.x;
        highp float phase = coord * 220.0;
        highp float s = sin(phase);
        highp float c = cos(phase);
        highp vec3 tangent = (abs(N.x) > 0.707) ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
        N = normalize(N + tangent * (c * 0.68));
        ribHighlight = pow(abs(s), 7.0) * 0.24 + pow(max(0.0, c), 12.0) * 0.18;
      }
      highp float ndotv = clamp(abs(dot(N, viewDir)), 0.0, 1.0);
      highp float fresnel = pow(1.0 - ndotv, 3.0);
      highp vec3 L = normalize(vec3(0.35, 0.85, 0.4));
      highp vec3 H = normalize(L + viewDir);
      highp float spec = pow(max(0.0, abs(dot(N, H))), 48.0) * 0.55;
      highp vec3 glassCol = mix(vec3(0.82, 0.90, 0.95), vec3(0.98, 0.995, 1.0), fresnel) + vec3(ribHighlight + spec);
      highp float alpha = clamp(((smShin > 9004.5) ? 0.26 : 0.18) + fresnel * 0.36 + ribHighlight * 0.45 + spec * 0.4, 0.14, 0.78);
      ${outVar} = vec4(glassCol, alpha);
    }
    else if (smShin > 9005.5 && smShin < 9006.5) {
      highp vec3 viewDir = normalize(u_SmartCameraPos.xyz - smWorldPos);
      highp float ndotv = clamp(abs(dot(smWorldNorm, viewDir)), 0.0, 1.0);
      highp float fresnel = pow(1.0 - ndotv, 2.6);
      highp vec3 L = normalize(vec3(0.35, 0.85, 0.4));
      highp vec3 H = normalize(L + viewDir);
      highp float spec = pow(max(0.0, abs(dot(smWorldNorm, H))), 56.0) * 0.52;
      highp vec3 baseTint = max(${outVar}.rgb, vec3(0.18));
      highp vec3 glassCol = mix(baseTint * 1.15, vec3(0.96, 0.98, 1.0), fresnel * 0.45) + vec3(spec);
      highp float alpha = clamp(0.46 + fresnel * 0.34 + spec * 0.35, 0.38, 0.84);
      ${outVar} = vec4(glassCol, alpha);
    }
  }
`;
      const lastBrace = cleanSrc.lastIndexOf('}');
      const newFs = cleanSrc.slice(0, lastBrace).replace(/precision\s+\w+\s+float\s*;/, (m) => m + '\n' + SMART_GLSL_UNIFORMS + '\n') + '\n' + injectLogic + '\n}\n';

      gl.shaderSource(fs, newFs);
      gl.compileShader(fs);
      (window.__smartPatchLog = window.__smartPatchLog || []).push({
        ok: !!gl.getShaderParameter(fs, gl.COMPILE_STATUS),
        log: String(gl.getShaderInfoLog(fs) || '').slice(0, 400)
      });
      if (gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
        gl.linkProgram(p);
        if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
          gl.shaderSource(fs, cleanSrc);
          gl.compileShader(fs);
          gl.linkProgram(p);
        }
      } else {
        gl.shaderSource(fs, cleanSrc);
        gl.compileShader(fs);
        gl.linkProgram(p);
      }

      bindUBOsAndSamplers(p, origUseProgram);
      p.__uSmartLocs = {
        mirrorTex: gl.getUniformLocation(p, 'u_SmartMirrorTex'),
        vpSize: gl.getUniformLocation(p, 'u_SmartViewportSize'),
        mirrorPass: gl.getUniformLocation(p, 'u_SmartMirrorPass'),
        mirrorPlane: gl.getUniformLocation(p, 'u_SmartMirrorPlane'),
        camPos: gl.getUniformLocation(p, 'u_SmartCameraPos'),
        lightCount: gl.getUniformLocation(p, 'u_SmartLightCount'),
        lightMin: gl.getUniformLocation(p, 'u_SmartLightMin'),
        lightMax: gl.getUniformLocation(p, 'u_SmartLightMax'),
        lightCol: gl.getUniformLocation(p, 'u_SmartLightCol')
      };
    };

    gl.useProgram = function(p) {
      origUseProgram(p);
      if (p) {
        if (!p.__smartV26Patched) ensurePatched(p);
        const locs = p.__uSmartLocs;
        const st = gl.__smartState;
        if (locs && st) {
          if (locs.mirrorTex !== null) gl.uniform1i(locs.mirrorTex, 7);
          if (locs.vpSize !== null) gl.uniform4fv(locs.vpSize, st.vpSize);
          if (locs.mirrorPass !== null) gl.uniform1i(locs.mirrorPass, st.pass);
          if (locs.mirrorPlane !== null) gl.uniform4fv(locs.mirrorPlane, st.plane);
          if (locs.camPos !== null) gl.uniform4fv(locs.camPos, st.camPos);
          if (locs.lightCount !== null) gl.uniform1i(locs.lightCount, st.lightCount || 0);
          if (locs.lightMin !== null && st.lightMin) gl.uniform4fv(locs.lightMin, st.lightMin);
          if (locs.lightMax !== null && st.lightMax) gl.uniform4fv(locs.lightMax, st.lightMax);
          if (locs.lightCol !== null && st.lightCol) gl.uniform4fv(locs.lightCol, st.lightCol);
        }
      }
    };

    if (!r.__origRenderScene) {
      r.__origRenderScene = r._renderScene.bind(r);
    }
    r._renderScene = function(e, t) {
      if (this.__inSmartMirrorPass) {
        return this.__origRenderScene(e, t);
      }
      const st = gl.__smartState;
      if (canvas.width !== gl.__smartMirrorW || canvas.height !== gl.__smartMirrorH) {
        gl.activeTexture(gl.TEXTURE7);
        gl.bindTexture(gl.TEXTURE_2D, gl.__smartMirrorTex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, Math.max(1, canvas.width), Math.max(1, canvas.height), 0, gl.RGB, gl.UNSIGNED_BYTE, null);
        gl.activeTexture(gl.TEXTURE0);
        gl.__smartMirrorW = canvas.width;
        gl.__smartMirrorH = canvas.height;
      }
      st.vpSize[0] = canvas.width || 1280;
      st.vpSize[1] = canvas.height || 720;

      const camNode = (v3d.camera && v3d.camera._cameraNode) || (this.camera && this.camera.mOwnerNode);
      if (!camNode || !camNode.getWorldMatrix) {
        return this.__origRenderScene(e, t);
      }
      const cm = camNode.getWorldMatrix().toArray();
      const E = { x: cm[12], y: cm[13], z: cm[14] };
      const B = { x: cm[8], y: cm[9], z: cm[10] }; // T3D camera +Z (backward: eye - target)
      const F = { x: -cm[8], y: -cm[9], z: -cm[10] }; // T3D camera -Z (forward: target - eye)
      const U = { x: cm[4], y: cm[5], z: cm[6] };

      // Smooth 0..100mm local halo around light elements (spheres, LED strips, multi-segment ceiling coves, and mirror backlight panels)
      const extractStripSegments = (mc, bb) => {
        if (mc._cachedLightSegments && mc._cachedLightBbKey === `${bb.min.x.toFixed(2)}_${bb.max.x.toFixed(2)}_${bb.min.z.toFixed(2)}_${bb.max.z.toFixed(2)}`) {
          return mc._cachedLightSegments;
        }
        try {
          const mesh = mc.getMesh && mc.getMesh();
          const md = (mesh && mesh.mMeshData) || (mesh && mesh.mMeshPart);
          const vd = md && md.mVertexData;
          const id = md && md.mIndexData;
          const owner = mc.mOwnerNode;
          const wm = owner && owner.getWorldMatrix && owner.getWorldMatrix();
          const m = wm && wm.toArray ? wm.toArray() : null;
          if (!vd || !id || !m) return null;
          const part = mesh.mParts && mesh.mParts[0];
          const vbf = part && part.mVertexBufferFormat;
          const vSize = (vbf && vbf.mVertexSize) || md.mVertexStride || 36;
          const isMulti = !!(vbf && vbf.mIsMultiStride);
          const vCount = Math.floor(vd.byteLength / vSize);
          const step = isMulti ? 3 : Math.floor(vSize / 4);
          const f32 = new Float32Array(vd.buffer, vd.byteOffset, isMulti ? vCount * 3 : Math.floor(vd.byteLength / 4));
          const u16 = new Uint16Array(id.buffer, id.byteOffset, Math.floor(id.byteLength / 2));
          const wx = new Float32Array(vCount);
          const wy = new Float32Array(vCount);
          const wz = new Float32Array(vCount);
          for (let i = 0; i < vCount; i++) {
            const x = f32[i * step], y = f32[i * step + 1], z = f32[i * step + 2];
            wx[i] = m[0] * x + m[4] * y + m[8] * z + m[12];
            wy[i] = m[1] * x + m[5] * y + m[9] * z + m[13];
            wz[i] = m[2] * x + m[6] * y + m[10] * z + m[14];
          }
          const xSlices = new Map();
          const zSlices = new Map();
          for (let i = 0; i + 2 < u16.length; i += 3) {
            const a = u16[i], b = u16[i + 1], c = u16[i + 2];
            if (a >= vCount || b >= vCount || c >= vCount) continue;
            const minX = Math.min(wx[a], wx[b], wx[c]), maxX = Math.max(wx[a], wx[b], wx[c]);
            const minY = Math.min(wy[a], wy[b], wy[c]), maxY = Math.max(wy[a], wy[b], wy[c]);
            const minZ = Math.min(wz[a], wz[b], wz[c]), maxZ = Math.max(wz[a], wz[b], wz[c]);
            const dx = maxX - minX, dz = maxZ - minZ;
            if (dx > 0.12 && dz < 0.08) {
              const zk = Math.round(((minZ + maxZ) * 0.5) * 10);
              const cur = xSlices.get(zk);
              if (!cur) xSlices.set(zk, { minX, maxX, minY, maxY, minZ, maxZ });
              else {
                cur.minX = Math.min(cur.minX, minX); cur.maxX = Math.max(cur.maxX, maxX);
                cur.minY = Math.min(cur.minY, minY); cur.maxY = Math.max(cur.maxY, maxY);
                cur.minZ = Math.min(cur.minZ, minZ); cur.maxZ = Math.max(cur.maxZ, maxZ);
              }
            } else if (dz > 0.12 && dx < 0.08) {
              const xk = Math.round(((minX + maxX) * 0.5) * 10);
              const cur = zSlices.get(xk);
              if (!cur) zSlices.set(xk, { minX, maxX, minY, maxY, minZ, maxZ });
              else {
                cur.minX = Math.min(cur.minX, minX); cur.maxX = Math.max(cur.maxX, maxX);
                cur.minY = Math.min(cur.minY, minY); cur.maxY = Math.max(cur.maxY, maxY);
                cur.minZ = Math.min(cur.minZ, minZ); cur.maxZ = Math.max(cur.maxZ, maxZ);
              }
            }
          }
          const segs = [...xSlices.values(), ...zSlices.values()];
          if (segs.length > 0) {
            mc._cachedLightBbKey = `${bb.min.x.toFixed(2)}_${bb.max.x.toFixed(2)}_${bb.min.z.toFixed(2)}_${bb.max.z.toFixed(2)}`;
            mc._cachedLightSegments = segs;
            return segs;
          }
        } catch (_) {}
        return null;
      };

      const nowMs = performance.now();
      const needSceneScan = !gl.__smartMirrorMcs || !gl.__smartAllLightSegs || window.__smartSceneCacheDirty || (nowMs - (gl.__smartLastScanTime || 0) > 1500);
      if (needSceneScan) {
        const wasDirty = !!window.__smartSceneCacheDirty;
        window.__smartSceneCacheDirty = false;
        gl.__smartLastScanTime = nowMs;
        gl.__smartMirrorPassForce = gl.__smartMirrorPassForce || wasDirty;

        const mirrorMcsSet = new Set();
        const seenLight = new Set();
        const allLightSegs = [];
        const addLightSegsForMc = (mc) => {
          if (!mc || seenLight.has(mc)) return;
          const m = mc.getMaterial && mc.getMaterial();
          const code = m && (m._smartType || m.mShininess);
          if (!(code > 9001.5 && code < 9003.5)) return;
          const owner = mc.mOwnerNode;
          const bb = owner && owner.getWorldBoundingBox && owner.getWorldBoundingBox();
          if (!bb || !isFinite(bb.min.x)) return;
          seenLight.add(mc);
          const sx = bb.max.x - bb.min.x, sy = bb.max.y - bb.min.y, sz = bb.max.z - bb.min.z;
          const dims = [sx, sy, sz].sort((a, b) => b - a);
          if (dims[2] <= 0.12 && dims[1] > 0.22 && sy <= 0.12) {
            const segs = extractStripSegments(mc, bb);
            if (segs && segs.length > 0) {
              for (const s of segs) {
                allLightSegs.push({ minX: s.minX, minY: s.minY, minZ: s.minZ, maxX: s.maxX, maxY: s.maxY, maxZ: s.maxZ, code });
              }
              return;
            }
          }
          if (dims[0] > 3.5 || dims[1] > 2.4 || dims[2] > 0.45) return;
          allLightSegs.push({ minX: bb.min.x, minY: bb.min.y, minZ: bb.min.z, maxX: bb.max.x, maxY: bb.max.y, maxZ: bb.max.z, code });
        };

        const dlSize = v3d.displayList ? Object.keys(v3d.displayList).length : 0;
        for (const [key, entry] of Array.from(smartPaintedRegistry.entries())) {
          if (!entry || !entry.spec) {
            smartPaintedRegistry.delete(key);
            continue;
          }
          let mc = entry.mc;
          const entExists = !!(entry.entityId && v3d.displayList && v3d.displayList[entry.entityId]);
          if (!entExists && v3d.displayList && entry._checkedDlSize !== dlSize) {
            entry._checkedDlSize = dlSize;
            const refBb = entry.savedBb || (mc && mc.mOwnerNode && mc.mOwnerNode.getWorldBoundingBox && (() => {
              const b = mc.mOwnerNode.getWorldBoundingBox();
              return (b && b.min && isFinite(b.min.x)) ? { min: [b.min.x, b.min.y, b.min.z], max: [b.max.x, b.max.y, b.max.z] } : null;
            })());
            if (refBb) {
              const rcx = 0.5 * (refBb.min[0] + refBb.max[0]), rcy = 0.5 * (refBb.min[1] + refBb.max[1]), rcz = 0.5 * (refBb.min[2] + refBb.max[2]);
              const rsx = refBb.max[0] - refBb.min[0], rsy = refBb.max[1] - refBb.min[1], rsz = refBb.max[2] - refBb.min[2];
              let bestCandId = null, bestCandMc = null, bestErr = 0.035;
              for (const [candId, candDisp] of Object.entries(v3d.displayList)) {
                if (!candDisp || !candDisp.node || !candDisp.entity) continue;
                const cls = String(candDisp.entity.Class || candDisp.entity.constructor.name || '');
                if (!/CustomizedPMInstanceModel/i.test(cls)) continue;
                const b = candDisp.node.getWorldBoundingBox && candDisp.node.getWorldBoundingBox();
                if (!b || !b.min || !isFinite(b.min.x)) continue;
                const cx = 0.5 * (b.min.x + b.max.x), cy = 0.5 * (b.min.y + b.max.y), cz = 0.5 * (b.min.z + b.max.z);
                const sx = b.max.x - b.min.x, sy = b.max.y - b.min.y, sz = b.max.z - b.min.z;
                const err = Math.hypot(cx - rcx, cy - rcy, cz - rcz) + Math.hypot(sx - rsx, sy - rsy, sz - rsz);
                if (err < bestErr) {
                  const candMcs = collectNodeMcs(candDisp.node);
                  if (candMcs[0] && !candMcs[0]._smartClearedByUser) {
                    bestErr = err;
                    bestCandId = candId;
                    bestCandMc = candMcs[0];
                  }
                }
              }
              if (bestCandMc && bestCandId) {
                smartPaintedRegistry.delete(key);
                applySmartSpecToMeshComponent(bestCandMc, entry.spec, bestCandId, true);
                mc = bestCandMc;
              }
            }
          } else if ((!mc || !mc.mOwnerNode || !mc.mOwnerNode.mScene) && entExists) {
            const disp = v3d.displayList[entry.entityId];
            if (disp && disp.node) {
              const mcs = collectNodeMcs(disp.node);
              mc = mcs.find(c => c.mOwnerNode && c.mOwnerNode.mName === entry.nodeName) || mcs[0] || mc;
              entry.mc = mc;
            }
          }
          if (mc && entExists) {
            const mat = mc.getMaterial && mc.getMaterial();
            if (mat) {
              if (!mat._isSmartPhongMat) {
                applySmartSpecToMeshComponent(mc, entry.spec, entry.entityId, true);
              } else if (mat._smartType !== entry.spec.code || mat.mShininess !== entry.spec.code) {
                applySmartCodeToT3dMaterial(mat, entry.spec.code);
              } else if (mat.setFloatParameter) {
                mat.setFloatParameter('Shininess', entry.spec.code);
              }
              if (mc.mOwnerNode) setOutlineNodesVisible(mc.mOwnerNode, false);
              if (entry.spec.code > 9000.5 && entry.spec.code < 9001.5) mirrorMcsSet.add(mc);
              else if (entry.spec.code > 9001.5 && entry.spec.code < 9003.5) addLightSegsForMc(mc);
            }
          }
        }

        if (v3d.displayList) {
          for (const disp of Object.values(v3d.displayList)) {
            if (!disp || !disp.node) continue;
            const ent = disp.entity;
            const cls = ent ? String(ent.Class || ent.constructor.name || '') : '';
            if (/Layer|Scene|CustomizedPMModel$/i.test(cls)) continue;
            const mcs = collectNodeMcs(disp.node);
            for (let i = 0; i < mcs.length; i++) {
              const mc = mcs[i];
              let mat = mc.getMaterial && mc.getMaterial();
              if (!mat) continue;
              if (!mat._smartType && !mc._smartClearedByUser && !mc._smartAutoChecked) {
                mc._smartAutoChecked = true;
                let autoSpec = null;
                if (mat.materialData) {
                  autoSpec = detectSmartSpecFromSeekOrUrl(mat.materialData.seekId, mat.materialData.textureURI || mat.materialData.textureUrl);
                }
                if (!autoSpec && ent && ent.materialMap && ent.materialMap.forEach) {
                  ent.materialMap.forEach((v) => {
                    if (!autoSpec && v) autoSpec = detectSmartSpecFromSeekOrUrl(v.seekId, v.texture || v.textureURI);
                  });
                }
                if (!autoSpec && ent && ent._materialByComponent && ent._materialByComponent.get && mc.mOwnerNode) {
                  const cm = ent._materialByComponent.get(mc.mOwnerNode.mName);
                  if (cm) autoSpec = detectSmartSpecFromSeekOrUrl(cm.seekId, cm.textureURI || cm.textureUrl);
                }
                if (autoSpec) {
                  applySmartSpecToMeshComponent(mc, autoSpec, ent && ent.id, true);
                  mat = mc.getMaterial && mc.getMaterial();
                }
              }
              const code = (mat && (mat._smartType || mat.mShininess)) || 0;
              if (code > 9000.5 && code < 9006.5) {
                if (!mat._isSmartPhongMat) {
                  applySmartSpecToMeshComponent(mc, CODE_TO_SPEC[code], ent && ent.id, true);
                  mat = mc.getMaterial && mc.getMaterial();
                }
                if (mat && mat.setFloatParameter) mat.setFloatParameter('Shininess', code);
                if (code < 9001.5) mirrorMcsSet.add(mc);
                else if (code > 9001.5 && code < 9003.5) addLightSegsForMc(mc);
              }
            }
          }
        }
        gl.__smartMirrorMcs = Array.from(mirrorMcsSet);
        gl.__smartAllLightSegs = allLightSegs;
        gl.__smartLastLightCam = null;
      }

      let bestMirror = null;
      let bestMirrorScore = 0.0001;
      const mirrorMcs = gl.__smartMirrorMcs || [];
      for (let i = 0; i < mirrorMcs.length; i++) {
        const mc = mirrorMcs[i];
        if (!mc || !mc.mOwnerNode || !mc.mOwnerNode.getWorldBoundingBox) continue;
        const mat = mc.getMaterial && mc.getMaterial();
        if (!mat) continue;
        const code = mat._smartType || mat.mShininess || 0;
        if (code < 9000.5 || code > 9001.5) continue;
        const bb = mc.mOwnerNode.getWorldBoundingBox();
        if (!bb || !bb.min || !bb.max || !isFinite(bb.min.x)) continue;
        const ctr = { x: (bb.max.x + bb.min.x) * 0.5, y: (bb.max.y + bb.min.y) * 0.5, z: (bb.max.z + bb.min.z) * 0.5 };
        const ext = { x: (bb.max.x - bb.min.x) * 0.5, y: (bb.max.y - bb.min.y) * 0.5, z: (bb.max.z - bb.min.z) * 0.5 };
        let nx = 0, ny = 0, nz = 0;
        if (ext.x <= ext.z && ext.x <= ext.y) nx = (E.x >= ctr.x) ? 1 : -1;
        else if (ext.z <= ext.x && ext.z <= ext.y) nz = (E.z >= ctr.z) ? 1 : -1;
        else ny = (E.y >= ctr.y) ? 1 : -1;
        const d = -(nx * ctr.x + ny * ctr.y + nz * ctr.z);
        const camSide = nx * E.x + ny * E.y + nz * E.z + d;
        if (camSide > 0.05) {
          const area = Math.min(4.0, Math.max(ext.x * 2, 0.1) * Math.max(ext.y * 2, 0.1) * Math.max(ext.z * 2, 0.1) / Math.max(Math.min(ext.x, ext.y, ext.z) * 2, 0.01));
          const dist = Math.hypot(ctr.x - E.x, ctr.y - E.y, ctr.z - E.z);
          if (dist > 25.0) continue;
          const toC = { x: (ctr.x - E.x) / Math.max(dist, 1e-3), y: (ctr.y - E.y) / Math.max(dist, 1e-3), z: (ctr.z - E.z) / Math.max(dist, 1e-3) };
          const facing = Math.max(0, toC.x * F.x + toC.y * F.y + toC.z * F.z);
          if (facing < 0.08) continue;
          const vertBonus = ny !== 0 ? 0.15 : 1.0;
          const score = (area * Math.pow(facing, 2) * vertBonus) / Math.pow(Math.max(dist, 0.25), 2);
          if (score > bestMirrorScore) {
            bestMirrorScore = score;
            bestMirror = { nx, ny, nz, d };
          }
        }
      }

      const allSegs = gl.__smartAllLightSegs || [];
      const prevLCam = gl.__smartLastLightCam;
      if (!prevLCam || Math.hypot(E.x - prevLCam.x, E.y - prevLCam.y, E.z - prevLCam.z) > 0.08) {
        gl.__smartLastLightCam = { x: E.x, y: E.y, z: E.z };
        for (let i = 0; i < allSegs.length; i++) {
          const s = allSegs[i];
          const clX = Math.max(s.minX, Math.min(E.x, s.maxX));
          const clY = Math.max(s.minY, Math.min(E.y, s.maxY));
          const clZ = Math.max(s.minZ, Math.min(E.z, s.maxZ));
          s.dist = Math.hypot(clX - E.x, clY - E.y, clZ - E.z);
        }
        allSegs.sort((a, b) => a.dist - b.dist);
        const lc = Math.min(24, allSegs.length);
        for (let i = 0; i < lc; i++) {
          const s = allSegs[i];
          st.lightMin.set([s.minX, s.minY, s.minZ, 0.105], i * 4);
          st.lightMax.set([s.maxX, s.maxY, s.maxZ, s.code], i * 4);
          const warm = s.code < 9002.5;
          st.lightCol.set(warm ? [1.0, 0.955, 0.86, 0.36] : [0.92, 0.965, 1.0, 0.36], i * 4);
        }
        st.lightCount = lc;
      }

      window.__smartDbg = { best: bestMirror, fbBefore: !!gl.getParameter(gl.FRAMEBUFFER_BINDING), E, lights: st.lightCount };
      if (bestMirror && canvas.width >= 380) {
        const { nx, ny, nz, d } = bestMirror;
        st.plane[0] = nx; st.plane[1] = ny; st.plane[2] = nz; st.plane[3] = d;
        const mKey = `${E.x.toFixed(3)}_${E.y.toFixed(3)}_${E.z.toFixed(3)}_${F.x.toFixed(3)}_${F.y.toFixed(3)}_${F.z.toFixed(3)}_${nx}_${ny}_${nz}_${d.toFixed(3)}_${canvas.width}_${canvas.height}`;
        if (gl.__smartLastMirrorKey !== mKey || gl.__smartMirrorPassForce) {
          gl.__smartLastMirrorKey = mKey;
          gl.__smartMirrorPassForce = false;
          const distE = nx * E.x + ny * E.y + nz * E.z + d;
          const E_ref = new T3D.Vector3(E.x - 2 * distE * nx, E.y - 2 * distE * ny, E.z - 2 * distE * nz);
          const dotBN = B.x * nx + B.y * ny + B.z * nz;
          const B_ref = new T3D.Vector3(B.x - 2 * dotBN * nx, B.y - 2 * dotBN * ny, B.z - 2 * dotBN * nz);
          const dotUN = U.x * nx + U.y * ny + U.z * nz;
          const U_ref = new T3D.Vector3(U.x - 2 * dotUN * nx, U.y - 2 * dotUN * ny, U.z - 2 * dotUN * nz);

          const savedWorldTrans = camNode.getWorldTransform().clone();
          const reflTrans = T3D.Transform.createLookAt(B_ref, U_ref, E_ref);
          const unhidden = [];
          try {
            camNode.setWorldTransform(reflTrans);
            if (camNode.transformChanged) camNode.transformChanged();
            const cc = this.camera;
            if (cc) {
              cc.mInverseWorldMatrixDirty = true;
              try { cc.onTransformChanged && cc.onTransformChanged(); } catch (err) {}
              try { cc.setCameraBitViewDirty && cc.setCameraBitViewDirty(); } catch (err) {}
              try { cc.update && cc.update(); } catch (err) {}
            }

            st.pass = 1;
            st.camPos[0] = E_ref.x; st.camPos[1] = E_ref.y; st.camPos[2] = E_ref.z;
            this.__inSmartMirrorPass = true;
            for (const dsp of Object.values(v3d.displayList || {})) {
              if (dsp && dsp.node && (dsp.__hiddenFromWallHide || dsp.__hiddenFromWallFaceHide || (dsp.node.mVisible === false && dsp.entity && /wall|face/i.test(String(dsp.entity.Class || dsp.entity.constructor.name || ''))))) {
                unhidden.push([dsp.node, dsp.node.mVisible, dsp.node.mEnable]);
                dsp.node.mVisible = true;
                dsp.node.mEnable = true;
              }
            }
            this.__origRenderScene(e, t);

            gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
            gl.activeTexture(gl.TEXTURE7);
            gl.bindTexture(gl.TEXTURE_2D, gl.__smartMirrorTex);
            gl.copyTexSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 0, 0, canvas.width, canvas.height);
            gl.activeTexture(gl.TEXTURE0);
          } finally {
            unhidden.forEach(([n, v, en]) => { n.mVisible = v; n.mEnable = en; });
            this.__inSmartMirrorPass = false;
            st.pass = 0;
            st.camPos[0] = E.x; st.camPos[1] = E.y; st.camPos[2] = E.z;
            camNode.setWorldTransform(savedWorldTrans);
            if (camNode.transformChanged) camNode.transformChanged();
            const cc = this.camera;
            if (cc) {
              cc.mInverseWorldMatrixDirty = true;
              try { cc.onTransformChanged && cc.onTransformChanged(); } catch (err) {}
              try { cc.setCameraBitViewDirty && cc.setCameraBitViewDirty(); } catch (err) {}
              try { cc.update && cc.update(); } catch (err) {}
            }
          }
        }
      }

      st.pass = 0;
      st.camPos[0] = E.x; st.camPos[1] = E.y; st.camPos[2] = E.z;
      gl.activeTexture(gl.TEXTURE7);
      gl.bindTexture(gl.TEXTURE_2D, gl.__smartMirrorTex);
      gl.activeTexture(gl.TEXTURE0);
      return this.__origRenderScene(e, t);
    };

    // Hook HSApp.View.T3d.Material.Material so any native 2D material applied or reset in DIY/Custom Cabinet or Wall editor immediately updates or clears our Smart Shader
    try {
      const T3dMatProto = window.HSApp && window.HSApp.View && window.HSApp.View.T3d && window.HSApp.View.T3d.Material && window.HSApp.View.T3d.Material.Material && window.HSApp.View.T3d.Material.Material.prototype;
      if (T3dMatProto && !T3dMatProto.__smartMatHookedV3) {
        T3dMatProto.__smartMatHookedV3 = true;
        ['changeWithUvTransform', '_changeWithUvTransform', 'changeFGIMaterialWithUvTransform', 'change'].forEach(fnName => {
          if (typeof T3dMatProto[fnName] === 'function') {
            const origFn = T3dMatProto[fnName];
            T3dMatProto[fnName] = function(mat, materialData, ...rest) {
              const res = origFn.call(this, mat, materialData, ...rest);
              const md = materialData || mat;
              const clearOrApply = (targetMat, spec) => {
                if (!targetMat) return;
                if (spec) {
                  applySmartCodeToT3dMaterial(targetMat, spec.code);
                } else {
                  applySmartCodeToT3dMaterial(targetMat, 0);
                  for (const [rk, rv] of Array.from(smartPaintedRegistry.entries())) {
                    if (rv && rv.mc && rv.mc.getMaterial && rv.mc.getMaterial() === targetMat) {
                      rv.mc._smartSpec = null;
                      rv.mc._smartType = 0;
                      rv.mc._smartClearedByUser = true;
                      smartPaintedRegistry.delete(rk);
                    }
                  }
                }
              };
              const sp = md ? detectSmartSpecFromSeekOrUrl(md.seekId, md.textureURI || md.textureUrl || md.texture) : null;
              if (res && typeof res.then === 'function') {
                res.then(rMat => clearOrApply(rMat || mat, sp)).catch(() => {});
              } else {
                clearOrApply(mat, sp);
              }
              return res;
            };
          }
        });
      }
    } catch (e) {}

    v3d.renderingMgr.needUpdate = true;
    if (v3d.context) v3d.context.needsRendering = true;
    return true;
  };

  installSmartViewportShaderEngine();

  // ============================================================================
  // TASK 1B: REGISTER "2D - Спецматериалы" IN HOMESTYLER FAVORITES ("Мой кабинет -> Избранное")
  // ============================================================================
  const makeSmartMaterialThumbDataUrl = (spec) => {
    try {
      const c = document.createElement('canvas');
      c.width = 160;
      c.height = 160;
      const ctx = c.getContext('2d');
      const [c1, c2] = spec.badgeBg || ['#3b82f6', '#1d4ed8'];
      const g = ctx.createLinearGradient(0, 0, 160, 160);
      g.addColorStop(0, c1);
      g.addColorStop(1, c2);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 160, 160);
      if (spec.code === 9001.0) {
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.beginPath();
        ctx.moveTo(20, 0); ctx.lineTo(70, 0); ctx.lineTo(0, 90); ctx.lineTo(0, 40); ctx.closePath();
        ctx.fill();
      } else if (spec.code === 9005.0) {
        ctx.fillStyle = 'rgba(255,255,255,0.22)';
        for (let x = 8; x < 160; x += 14) ctx.fillRect(x, 0, 5, 160);
      }
      ctx.fillStyle = 'rgba(15,23,42,0.72)';
      ctx.fillRect(0, 114, 160, 46);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(spec.shortName, 80, 142);
      return c.toDataURL('image/png');
    } catch (e) {
      return '';
    }
  };

  // ============================================================================
  // TASK 2: SKYPRO 3DSKY PRO STUDIO + NATIVE HOMESTYLER MODEL CONVERTER
  // ============================================================================
  const fetchAsDataUrl = async (url) => {
    const r = await fetch(url);
    const b = await r.blob();
    return await new Promise(res => {
      const reader = new FileReader();
      reader.onload = () => res(reader.result);
      reader.readAsDataURL(b);
    });
  };

  const rgbToHexInt = (rgb) => {
    if (!Array.isArray(rgb) || rgb.length < 3) return 0xffffff;
    const r = Math.max(0, Math.min(255, Math.round(rgb[0] * 255)));
    const g = Math.max(0, Math.min(255, Math.round(rgb[1] * 255)));
    const b = Math.max(0, Math.min(255, Math.round(rgb[2] * 255)));
    return (r << 16) | (g << 8) | b;
  };

  const modelCache = {};
  const skyProRegistry = window.__skyProRegistry || (window.__skyProRegistry = new Map());

  const fixGltfTextureFlipY = (tex) => {
    if (!tex) return;
    try {
      if (tex.mTexture && tex.mTexture.mTextureData) {
        tex.mTexture.mTextureData.mFlipY = false;
        tex.mTexture.mRenderDataExpired = true;
      }
    } catch (e) {}
  };

  const loadModelResources = async (item) => {
    if (modelCache[item.id]) return modelCache[item.id];

    const matResp = await fetch(SERVER_ORIGIN + '/converted/' + item.id + '/materials.json?t=' + Date.now());
    const matJson = await matResp.json();
    const matsObj = matJson.materials || {};
    const partsMeta = matJson.parts || [];
    const nodesMeta = matJson.nodes || [];

    const getMapUrl = (chObj) => {
      if (!chObj || !chObj.file) return null;
      const baseName = chObj.file.split(/[/\\]/).pop();
      return SERVER_ORIGIN + '/converted/' + item.id + '/maps/' + baseName;
    };

    const matByName = {};
    for (const [k, m] of Object.entries(matsObj)) {
      const mName = m.name || k;
      matByName[mName] = m;
      matByName[k] = m;
      const bcCh = m.channels && m.channels.baseColor;
      const normCh = m.channels && m.channels.normal;
      const uvScale = (bcCh && bcCh.uvScale) || (normCh && normCh.uvScale) || [1, 1];
      m._uvScale = uvScale;
      if (bcCh && bcCh.file) {
        const bName = bcCh.file.split(/[/\\]/).pop() || '';
        m._isReflectionDirtMap = /_(specularColor|glossiness)\./i.test(bName);
      }

      const bcUrl = getMapUrl(bcCh);
      if (bcUrl) {
        try {
          const dataUrl = await fetchAsDataUrl(bcUrl);
          m._baseColorDataUrl = dataUrl;
          const tex = await window.ResourceManager.load(dataUrl, window.HSApp.Io.Load.LoadTypeEnum.T3dContentTexture, {
            wrap: 1000,
            repeatX: uvScale[0] || 1,
            repeatY: uvScale[1] || 1,
            skipCache: true
          });
          fixGltfTextureFlipY(tex);
          m._loadedBaseTex = tex;
        } catch (e) {}
      }
      const normUrl = getMapUrl(normCh);
      if (normUrl) {
        try {
          const dataUrl = await fetchAsDataUrl(normUrl);
          m._normalDataUrl = dataUrl;
          const ntex = await window.ResourceManager.load(dataUrl, window.HSApp.Io.Load.LoadTypeEnum.T3dMoldingNormalTexture, {
            wrap: 1000,
            repeatX: uvScale[0] || 1,
            repeatY: uvScale[1] || 1,
            skipCache: true
          });
          fixGltfTextureFlipY(ntex);
          m._loadedNormalTex = ntex;
        } catch (e) {}
      }
    }

    const partMatMap = {};
    for (const p of partsMeta) {
      if (p.name && p.materials && p.materials[0]) {
        partMatMap[p.name] = p.materials[0];
      }
    }

    let glbResp = await fetch(SERVER_ORIGIN + '/converted/' + item.id + '/model_hs.glb?t=' + Date.now());
    if (!glbResp.ok) {
      const fallbackPath = item.glb || item.glbUrl || ('/converted/' + item.id + '/model.glb');
      glbResp = await fetch(SERVER_ORIGIN + fallbackPath);
    }
    const rawGlbBuf = await glbResp.arrayBuffer();
    const glbBuf = splitLargeGlbPrimitivesForHomestyler(rawGlbBuf);

    const entry = { matJson, matsObj, matByName, partMatMap, partsMeta, nodesMeta, glbBuf };
    modelCache[item.id] = entry;
    return entry;
  };

  function splitLargeGlbPrimitivesForHomestyler(rawBuf) {
    try {
      if (!rawBuf || rawBuf.byteLength < 28) return rawBuf;
      const dv = new DataView(rawBuf);
      if (dv.getUint32(0, true) !== 0x46546C67) return rawBuf;
      const jLen = dv.getUint32(12, true);
      const gltf = JSON.parse(new TextDecoder().decode(new Uint8Array(rawBuf, 20, jLen)));
      const binStart = 20 + jLen;
      if (binStart + 8 > rawBuf.byteLength) return rawBuf;
      const bLen = dv.getUint32(binStart, true);
      const binOffset = binStart + 8;

      const accessors = gltf.accessors || [];
      const bufferViews = gltf.bufferViews || [];
      const meshes = gltf.meshes || [];
      const nodes = gltf.nodes || [];
      const MAX_CHUNK_INDICES = 54000; // 18,000 triangles per chunk (< 65,535 Uint16 limit)

      let needsSplit = false;
      for (let m = 0; m < meshes.length; m++) {
        const prims = (meshes[m] && meshes[m].primitives) || [];
        for (let p = 0; p < prims.length; p++) {
          const pr = prims[p];
          const idxAcc = pr.indices != null ? accessors[pr.indices] : null;
          const posAcc = (pr.attributes && pr.attributes.POSITION != null) ? accessors[pr.attributes.POSITION] : null;
          if (idxAcc && (idxAcc.count > 60000 || idxAcc.componentType === 5125)) { needsSplit = true; break; }
          if (posAcc && posAcc.count > 65535) { needsSplit = true; break; }
        }
        if (needsSplit) break;
      }
      if (!needsSplit) return rawBuf;

      const extraChunks = [];
      let curByteLen = bLen;
      const initPad = (4 - (curByteLen % 4)) % 4;
      if (initPad > 0) {
        extraChunks.push(new Uint8Array(initPad));
        curByteLen += initPad;
      }

      const appendBv = (typedArr, target) => {
        const u8 = new Uint8Array(typedArr.buffer, typedArr.byteOffset, typedArr.byteLength);
        const pad = (4 - (u8.byteLength % 4)) % 4;
        const bvIdx = bufferViews.length;
        const bvObj = { buffer: 0, byteOffset: curByteLen, byteLength: u8.byteLength };
        if (target) bvObj.target = target;
        bufferViews.push(bvObj);
        extraChunks.push(u8);
        curByteLen += u8.byteLength;
        if (pad > 0) {
          extraChunks.push(new Uint8Array(pad));
          curByteLen += pad;
        }
        return bvIdx;
      };

      const readFloatAttr = (accIdx, nComp) => {
        if (accIdx == null || !accessors[accIdx]) return null;
        const acc = accessors[accIdx];
        const bv = bufferViews[acc.bufferView];
        const baseOff = binOffset + (bv.byteOffset || 0) + (acc.byteOffset || 0);
        const stride = bv.byteStride || (nComp * 4);
        if (stride === nComp * 4 && (baseOff % 4 === 0)) {
          return new Float32Array(rawBuf, baseOff, acc.count * nComp);
        }
        const out = new Float32Array(acc.count * nComp);
        for (let i = 0; i < acc.count; i++) {
          const rowOff = baseOff + i * stride;
          for (let c = 0; c < nComp; c++) out[i * nComp + c] = dv.getFloat32(rowOff + c * 4, true);
        }
        return out;
      };

      const readIndices = (accIdx) => {
        const acc = accessors[accIdx];
        const bv = bufferViews[acc.bufferView];
        const baseOff = binOffset + (bv.byteOffset || 0) + (acc.byteOffset || 0);
        if (acc.componentType === 5125) {
          if (baseOff % 4 === 0) return new Uint32Array(rawBuf, baseOff, acc.count);
          const out = new Uint32Array(acc.count);
          for (let i = 0; i < acc.count; i++) out[i] = dv.getUint32(baseOff + i * 4, true);
          return out;
        }
        if (acc.componentType === 5123) {
          if (baseOff % 2 === 0) return new Uint16Array(rawBuf, baseOff, acc.count);
          const out = new Uint16Array(acc.count);
          for (let i = 0; i < acc.count; i++) out[i] = dv.getUint16(baseOff + i * 2, true);
          return out;
        }
        return new Uint8Array(rawBuf, baseOff, acc.count);
      };

      const splitPrimitiveIntoSinglePrims = (pr) => {
        const idxAcc = pr.indices != null ? accessors[pr.indices] : null;
        const posAcc = (pr.attributes && pr.attributes.POSITION != null) ? accessors[pr.attributes.POSITION] : null;
        if (!idxAcc || !posAcc) return [pr];
        if (idxAcc.count <= 60000 && idxAcc.componentType === 5123 && posAcc.count <= 65535) {
          return [pr];
        }
        // Fast path: vertices already fit in Uint16 (<= 65535), only index count > 60000
        if (idxAcc.componentType === 5123 && posAcc.count <= 65535) {
          const outPrims = [];
          const baseOff = idxAcc.byteOffset || 0;
          for (let start = 0; start < idxAcc.count; start += MAX_CHUNK_INDICES) {
            const cnt = Math.min(idxAcc.count - start, MAX_CHUNK_INDICES);
            const newIdxAccIndex = accessors.length;
            accessors.push({
              bufferView: idxAcc.bufferView,
              byteOffset: baseOff + start * 2,
              componentType: 5123,
              count: cnt,
              type: 'SCALAR'
            });
            const cp = Object.assign({}, pr, { indices: newIdxAccIndex });
            outPrims.push(cp);
          }
          return outPrims;
        }

        // General path: Uint32 indices or > 65535 vertices -> remap each chunk into compact Uint16 vertices + indices
        const srcIdx = readIndices(pr.indices);
        const srcPos = readFloatAttr(pr.attributes.POSITION, 3);
        const srcNorm = pr.attributes.NORMAL != null ? readFloatAttr(pr.attributes.NORMAL, 3) : null;
        const srcUv = pr.attributes.TEXCOORD_0 != null ? readFloatAttr(pr.attributes.TEXCOORD_0, 2) : null;
        if (!srcPos) return [pr];

        const outPrims = [];
        const remap = new Int32Array(posAcc.count);
        for (let start = 0; start < srcIdx.length; start += MAX_CHUNK_INDICES) {
          const cnt = Math.min(srcIdx.length - start, MAX_CHUNK_INDICES);
          remap.fill(-1);
          const chunkIdx = new Uint16Array(cnt);
          const usedVerts = [];
          for (let i = 0; i < cnt; i++) {
            const oldV = srcIdx[start + i];
            let newV = remap[oldV];
            if (newV === -1) {
              newV = usedVerts.length;
              remap[oldV] = newV;
              usedVerts.push(oldV);
            }
            chunkIdx[i] = newV;
          }
          const vCnt = usedVerts.length;
          const chunkPos = new Float32Array(vCnt * 3);
          let minX = Infinity, minY = Infinity, minZ = Infinity;
          let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
          for (let i = 0; i < vCnt; i++) {
            const ov = usedVerts[i] * 3;
            const x = srcPos[ov], y = srcPos[ov + 1], z = srcPos[ov + 2];
            chunkPos[i * 3] = x; chunkPos[i * 3 + 1] = y; chunkPos[i * 3 + 2] = z;
            if (x < minX) minX = x; if (x > maxX) maxX = x;
            if (y < minY) minY = y; if (y > maxY) maxY = y;
            if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
          }
          const newAttrs = {};
          const posBv = appendBv(chunkPos, 34962);
          newAttrs.POSITION = accessors.length;
          accessors.push({ bufferView: posBv, byteOffset: 0, componentType: 5126, count: vCnt, type: 'VEC3', min: [minX, minY, minZ], max: [maxX, maxY, maxZ] });

          if (srcNorm) {
            const chunkNorm = new Float32Array(vCnt * 3);
            for (let i = 0; i < vCnt; i++) {
              const ov = usedVerts[i] * 3;
              chunkNorm[i * 3] = srcNorm[ov]; chunkNorm[i * 3 + 1] = srcNorm[ov + 1]; chunkNorm[i * 3 + 2] = srcNorm[ov + 2];
            }
            const normBv = appendBv(chunkNorm, 34962);
            newAttrs.NORMAL = accessors.length;
            accessors.push({ bufferView: normBv, byteOffset: 0, componentType: 5126, count: vCnt, type: 'VEC3' });
          }
          if (srcUv) {
            const chunkUv = new Float32Array(vCnt * 2);
            for (let i = 0; i < vCnt; i++) {
              const ov = usedVerts[i] * 2;
              chunkUv[i * 2] = srcUv[ov]; chunkUv[i * 2 + 1] = srcUv[ov + 1];
            }
            const uvBv = appendBv(chunkUv, 34962);
            newAttrs.TEXCOORD_0 = accessors.length;
            accessors.push({ bufferView: uvBv, byteOffset: 0, componentType: 5126, count: vCnt, type: 'VEC2' });
          }
          const idxBv = appendBv(chunkIdx, 34963);
          const newIdxAcc = accessors.length;
          accessors.push({ bufferView: idxBv, byteOffset: 0, componentType: 5123, count: cnt, type: 'SCALAR' });

          const cp = { attributes: newAttrs, indices: newIdxAcc };
          if (pr.material != null) cp.material = pr.material;
          if (pr.mode != null) cp.mode = pr.mode;
          outPrims.push(cp);
        }
        return outPrims;
      };

      const origNodeCount = nodes.length;
      for (let nIdx = 0; nIdx < origNodeCount; nIdx++) {
        const node = nodes[nIdx];
        if (!node || node.mesh == null || !meshes[node.mesh]) continue;
        const origMesh = meshes[node.mesh];
        const prims = origMesh.primitives || [];
        const expandedPrims = [];
        for (let i = 0; i < prims.length; i++) {
          const splitList = splitPrimitiveIntoSinglePrims(prims[i]);
          for (let j = 0; j < splitList.length; j++) expandedPrims.push(splitList[j]);
        }
        if (expandedPrims.length === 1) {
          origMesh.primitives = expandedPrims;
        } else if (expandedPrims.length > 1) {
          const baseName = node.name || origMesh.name || ('Part_' + nIdx);
          delete node.mesh;
          node.children = Array.isArray(node.children) ? node.children.slice() : [];
          for (let k = 0; k < expandedPrims.length; k++) {
            const childMeshIdx = meshes.length;
            meshes.push({ name: baseName, primitives: [expandedPrims[k]] });
            const childNodeIdx = nodes.length;
            nodes.push({ name: baseName, mesh: childMeshIdx });
            node.children.push(childNodeIdx);
          }
        }
      }

      if (gltf.buffers && gltf.buffers[0]) {
        gltf.buffers[0].byteLength = curByteLen;
      }

      const jsonBytes = new TextEncoder().encode(JSON.stringify(gltf));
      const jPad = (4 - (jsonBytes.byteLength % 4)) % 4;
      const paddedJsonLen = jsonBytes.byteLength + jPad;
      const totalOutLen = 12 + 8 + paddedJsonLen + 8 + curByteLen;

      const outBuf = new ArrayBuffer(totalOutLen);
      const outDv = new DataView(outBuf);
      const outU8 = new Uint8Array(outBuf);

      outDv.setUint32(0, 0x46546C67, true);
      outDv.setUint32(4, 2, true);
      outDv.setUint32(8, totalOutLen, true);
      outDv.setUint32(12, paddedJsonLen, true);
      outDv.setUint32(16, 0x4E4F534A, true);
      outU8.set(jsonBytes, 20);
      for (let i = 0; i < jPad; i++) outU8[20 + jsonBytes.byteLength + i] = 0x20;

      const newBinStart = 20 + paddedJsonLen;
      outDv.setUint32(newBinStart, curByteLen, true);
      outDv.setUint32(newBinStart + 4, 0x004E4942, true);
      outU8.set(new Uint8Array(rawBuf, binOffset, bLen), newBinStart + 8);
      let writeOff = newBinStart + 8 + bLen;
      for (let i = 0; i < extraChunks.length; i++) {
        outU8.set(extraChunks[i], writeOff);
        writeOff += extraChunks[i].byteLength;
      }
      return outBuf;
    } catch (err) {
      console.warn('[SkyPro] splitLargeGlbPrimitivesForHomestyler fallback:', err);
      return rawBuf;
    }
  }

  const applyUvTransformToPhong = (phongMat, scaleMul = 1.0, rotDeg = 0) => {
    if (!phongMat) return;
    const baseUv = (phongMat._skyProMatInfo && phongMat._skyProMatInfo._uvScale) || [1, 1];
    const rx = (baseUv[0] || 1) * scaleMul;
    const ry = (baseUv[1] || 1) * scaleMul;
    const rad = (rotDeg || 0) * Math.PI / 180;
    if (phongMat.setRepeat) phongMat.setRepeat({ x: rx, y: ry });
    if (phongMat.setRotation) phongMat.setRotation(rad);
    phongMat._userScaleMul = scaleMul;
    phongMat._userRotDeg = rotDeg;
  };

  const createPhongMatFromInfo = (mInfo, scaleMul = 1.0, rotDeg = 0) => {
    const bc = (mInfo && Array.isArray(mInfo.baseColor) && mInfo.baseColor.length >= 3) ? mInfo.baseColor : [0.85, 0.85, 0.85];
    const specCol = (mInfo && Array.isArray(mInfo.specularColor) && mInfo.specularColor.length >= 3) ? mInfo.specularColor : bc;
    const isMet = !!(mInfo && Number(mInfo.metallic || 0) >= 0.45);
    const maxBc = Math.max(bc[0], bc[1], bc[2]);
    const minBc = Math.min(bc[0], bc[1], bc[2]);
    const spreadBc = maxBc - minBc;
    const maxSpec = Math.max(specCol[0], specCol[1], specCol[2]);
    const minSpec = Math.min(specCol[0], specCol[1], specCol[2]);
    const spreadSpec = maxSpec - minSpec;

    let effectiveRgb = bc;
    if (isMet) {
      const rawMet = (spreadSpec > spreadBc + 0.03 || (maxBc < 0.25 && maxSpec > maxBc)) ? specCol : bc;
      const mx = Math.max(rawMet[0], rawMet[1], rawMet[2]);
      if (mx < 0.15) {
        effectiveRgb = [0.78, 0.78, 0.80];
      } else if (mx < 0.85) {
        const boost = Math.min(1.35, 0.88 / mx);
        effectiveRgb = [Math.min(1, rawMet[0] * boost), Math.min(1, rawMet[1] * boost), Math.min(1, rawMet[2] * boost)];
      } else {
        effectiveRgb = rawMet;
      }
    }

    const useWhiteForTex = !!(mInfo && mInfo._loadedBaseTex && !(isMet && mInfo._isReflectionDirtMap && spreadSpec > 0.04));
    const hexColor = useWhiteForTex ? 0xffffff : rgbToHexInt(effectiveRgb);
    const phongMat = new T3D.MeshPhongMaterial({
      color: hexColor,
      opacity: 1.0,
      transparent: false
    });
    if (phongMat.setCullMode && T3D.RasterizerCullMode) {
      phongMat.setCullMode(T3D.RasterizerCullMode.CM_None);
    }
    if (mInfo) {
      if (mInfo._loadedBaseTex && phongMat.setDiffuseTexture) {
        fixGltfTextureFlipY(mInfo._loadedBaseTex);
        phongMat.setDiffuseTexture(mInfo._loadedBaseTex);
      }
      if (mInfo._loadedNormalTex && phongMat.setNormalTexture) {
        fixGltfTextureFlipY(mInfo._loadedNormalTex);
        phongMat.setNormalTexture(mInfo._loadedNormalTex);
      }
      if (phongMat.setSpecular) {
        const specHex = isMet ? rgbToHexInt(effectiveRgb) : ((mInfo.transmission || 0) >= 0.25 ? 0xffffff : 0x2a2a2a);
        phongMat.setSpecular(specHex);
      }
      if (phongMat.setShininess) {
        const shin = Math.max(12, Math.round((1.0 - (mInfo.roughness != null ? mInfo.roughness : 0.4)) * 120));
        phongMat.setShininess(shin);
      }

      if (mInfo._smartSpec) {
        applySmartCodeToT3dMaterial(phongMat, mInfo._smartSpec.code);
      } else {
        const emStr = Number(mInfo.emissionStrength || 0);
        const trans = Number(mInfo.transmission || 0);
        const opac = mInfo.opacity != null ? Number(mInfo.opacity) : 1.0;

        if (emStr > 0.05 || mInfo.sourceClass === 'CoronaLightMtl' || mInfo.sourceClass === 'VRayLightMtl') {
          const em = Array.isArray(mInfo.emission) && mInfo.emission.length >= 3 ? mInfo.emission : bc;
          const isWarmEm = (em[0] - em[2]) > 0.08;
          applySmartCodeToT3dMaterial(phongMat, isWarmEm ? 9002.0 : 9003.0);
        } else if (trans >= 0.28 || (opac < 0.92 && !mInfo._loadedBaseTex)) {
          if (spreadBc > 0.05) {
            if (phongMat.setColor) phongMat.setColor(rgbToHexInt(bc));
            applySmartCodeToT3dMaterial(phongMat, 9006.0);
          } else {
            applySmartCodeToT3dMaterial(phongMat, 9004.0);
          }
        }
      }
      phongMat._skyProMatInfo = mInfo;
    }
    phongMat._isSkyProMaterial = true;
    applyUvTransformToPhong(phongMat, scaleMul, rotDeg);
    return phongMat;
  };

  const buildTexturedRootNode = async (item, checkedPartNames, paintedMap) => {
    const res = await loadModelResources(item);
    const blobUrl = URL.createObjectURL(new Blob([res.glbBuf], { type: 'model/gltf-binary' }));
    let gltfNode;
    try {
      gltfNode = await window.ResourceManager.load(blobUrl, window.HSApp.Io.Load.LoadTypeEnum.GltfModel, { skipCache: true });
    } finally {
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
    }

    const allowedSet = new Set(checkedPartNames || []);
    const allMcs = collectNodeMcs(gltfNode);
    const keptMcs = allMcs.filter(mc => {
      const name = mc.mOwnerNode ? mc.mOwnerNode.mName : '';
      return allowedSet.size === 0 || allowedSet.has(name);
    });
    const finalMcs = keptMcs.length > 0 ? keptMcs : allMcs;

    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    finalMcs.forEach(mc => {
      const n = mc.mOwnerNode;
      const wbb = n.getWorldBoundingBox();
      if (wbb && wbb.min && wbb.max) {
        minX = Math.min(minX, wbb.min.x);
        minY = Math.min(minY, wbb.min.y);
        minZ = Math.min(minZ, wbb.min.z);
        maxX = Math.max(maxX, wbb.max.x);
        maxY = Math.max(maxY, wbb.max.y);
        maxZ = Math.max(maxZ, wbb.max.z);
      }
    });

    const cx = isFinite(minX) ? 0.5 * (minX + maxX) : 0;
    const cy = isFinite(minY) ? 0.5 * (minY + maxY) : 0;
    const cz = isFinite(minZ) ? 0.5 * (minZ + maxZ) : 0;
    const XLength = isFinite(minX) ? Math.max(0.05, maxX - minX) : 0.5;
    const ZLength = isFinite(minY) ? Math.max(0.05, maxY - minY) : 0.5;
    const YLength = isFinite(minZ) ? Math.max(0.05, maxZ - minZ) : 0.5;

    const rootNode = new T3D.Node('SkyProRoot');
    const offsetMat = T3D.Matrix.Translation(-cx, -cy, -cz);
    const matsList = Object.values(res.matByName);

    finalMcs.forEach((mc, idx) => {
      const origNode = mc.mOwnerNode;
      const nodeName = origNode ? origNode.mName : '';
      const wm = origNode.getWorldMatrix().clone();
      const finalMat = wm.multiply(offsetMat);

      const mesh = mc.getMesh();
      if (mesh) {
        if (mesh.setName) mesh.setName(nodeName);
        new T3D.MeshAccessor(mesh).applyMatrix(finalMat);
        mesh.appliedMatrix = true;
        const wbb = origNode.getWorldBoundingBox();
        if (wbb && mesh.mBoundingBox) {
          mesh.mBoundingBox.min.x = wbb.min.x - cx;
          mesh.mBoundingBox.min.y = wbb.min.y - cy;
          mesh.mBoundingBox.min.z = wbb.min.z - cz;
          mesh.mBoundingBox.max.x = wbb.max.x - cx;
          mesh.mBoundingBox.max.y = wbb.max.y - cy;
          mesh.mBoundingBox.max.z = wbb.max.z - cz;
        }
      }

      const defaultMatName = res.partMatMap[nodeName];
      const mInfo = (defaultMatName && res.matByName[defaultMatName]) || matsList[idx] || matsList[0];
      const phongMat = (paintedMap && paintedMap[nodeName]) ? paintedMap[nodeName] : createPhongMatFromInfo(mInfo, 1.0, 0);
      if (phongMat) {
        phongMat._defaultMatName = defaultMatName || (mInfo && mInfo.name) || '';
      }

      const childNode = new T3D.Node(nodeName);
      const newMc = new T3D.MeshComponent();
      if (newMc.setName) newMc.setName(nodeName);
      newMc.setMesh(mesh);
      const origSetMaterial = newMc.setMaterial.bind(newMc);
      origSetMaterial(phongMat);
      newMc._origSetMaterial = origSetMaterial;
      newMc.setMaterial = function(m) {
        if (m && (m._isSkyProMaterial || m._smartSpec)) {
          return origSetMaterial(m);
        }
        return;
      };
      childNode.addComponent(newMc);
      rootNode.addChild(childNode);
    });

    return { rootNode, XLength, YLength, ZLength, keptCount: finalMcs.length };
  };

  let lastInsertedContent = null;
  let lastPaintedMeshComponent = null;

  let nativeSampleMeta = null;
  app.floorplan.forEachContent(c => {
    if (c.metadata && c.metadata.clone && !String(c.metadata.seekId || '').startsWith('skypro_')) {
      const sId = String(c.metadata.seekId || '');
      if (sId !== 'f3dd1512-9392-4c31-8f96-f1c38e791f6f' && (!nativeSampleMeta || (c.XLength < 0.8 && c.YLength < 0.8))) {
        nativeSampleMeta = c.metadata;
      } else if (!nativeSampleMeta) {
        nativeSampleMeta = c.metadata;
      }
    }
  });

  const attachSkyProDisplay = async (content, item, checkedPartNames, paintedMaterials, keepDimensions) => {
    Object.defineProperty(content, '_skyProId', { value: item.id, writable: true, enumerable: false, configurable: true });
    Object.defineProperty(content, '_skyProItem', { value: item, writable: true, enumerable: false, configurable: true });
    Object.defineProperty(content, '_skyProCheckedParts', { value: Array.from(checkedPartNames || []), writable: true, enumerable: false, configurable: true });
    const pMap = {};
    if (paintedMaterials) {
      for (const [k, v] of Object.entries(paintedMaterials)) pMap[k] = v;
    }
    Object.defineProperty(content, '_skyProPaintedMaterials', { value: pMap, writable: true, enumerable: false, configurable: true });
    content.displayName = item.title;
    skyProRegistry.set(item.title, { item, checkedPartNames: Array.from(checkedPartNames || []), paintedMaterials: pMap });

    const built = await buildTexturedRootNode(item, checkedPartNames, pMap);
    if (!keepDimensions) {
      content.XLength = built.XLength;
      content.YLength = built.YLength;
      content.ZLength = built.ZLength;
      content.XScale = 1;
      content.YScale = 1;
      content.ZScale = 1;
    }

    for (let attempt = 0; attempt < 10; attempt++) {
      const v3d = app.getActive3DView();
      const disp = v3d ? v3d.displayList[content.id] : null;
      if (disp) {
        disp.getModel3d = () => '';
        disp.getModel3dAsync = () => Promise.resolve('');
        disp._loadModel = () => Promise.resolve();
        disp._loadTexture = () => Promise.resolve();
        if (disp._loadingBox && disp.node) {
          disp.node.removeChild(disp._loadingBox);
          disp._loadingBox = undefined;
        }
        if (disp._modelNode && disp.getTransNode) {
          disp.getTransNode().removeChild(disp._modelNode);
        }
        disp._applyModel(built.rootNode, {});
        if (disp.dirtyGraph) disp.dirtyGraph();
        if (v3d.context) v3d.context.needsRendering = true;
        break;
      }
      await new Promise(r => setTimeout(r, 60));
    }
    return built;
  };

  const isOurContentForItem = (ent, itemId) => {
    if (!ent) return false;
    if (ent._skyProId === itemId) return true;
    const seekStr = String((ent.metadata && ent.metadata.seekId) || ent.seekId || '');
    return seekStr.startsWith('skypro_' + itemId);
  };

  window.__updateSkyProLiveParts = async (item, checkedPartNames) => {
    const sel = app.selectionManager.selected()[0] || lastInsertedContent;
    if (!isOurContentForItem(sel, item.id)) return null;
    const built = await attachSkyProDisplay(sel, item, checkedPartNames, sel._skyProPaintedMaterials, false);
    if (sel.dirty) sel.dirty();
    return {
      cmSize: Math.round(built.XLength * 100) + '×' + Math.round(built.YLength * 100) + '×' + Math.round(built.ZLength * 100) + ' см',
      keptCount: built.keptCount
    };
  };

  window.__insertSkyProModel = async (item, checkedPartNames, posOverride) => {
    const cam = app.floorplan.active_camera;
    let tx = cam ? (cam.target_x || 0) : 0;
    let ty = cam ? (cam.target_y || 0) : 0;
    if (cam && typeof cam.x === 'number' && typeof cam.y === 'number') {
      const dx = tx - cam.x;
      const dy = ty - cam.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 0.2) {
        const placeDist = Math.min(Math.max(dist * 0.65, 1.25), 2.0);
        tx = cam.x + (dx / dist) * placeDist;
        ty = cam.y + (dy / dist) * placeDist;
      }
    }
    if (posOverride && typeof posOverride.x === 'number' && typeof posOverride.y === 'number') {
      tx = posOverride.x;
      ty = posOverride.y;
    }

    let targetFloor = null;
    app.floorplan.scene.activeLayer.forEachFloor(fl => {
      if (!targetFloor) targetFloor = fl;
    });

    const built = await buildTexturedRootNode(item, checkedPartNames, null);

    let sampleMeta = nativeSampleMeta;
    if (!sampleMeta) {
      app.floorplan.forEachContent(c => {
        if (!sampleMeta && c.metadata && c.metadata.clone) sampleMeta = c.metadata;
      });
    }
    const meta = sampleMeta.clone();
    meta.name = item.title;
    meta.XLength = built.XLength;
    meta.YLength = built.YLength;
    meta.ZLength = built.ZLength;
    meta.model3d = '';
    meta.model = null;
    meta.modelTexture = '';
    meta.scaleRule = null;
    meta.extension = null;
    meta.isScalable = true;

    const content = HSCore.Model.Content.create(meta);
    content.displayName = item.title;
    content.x = tx;
    content.y = ty;
    content.z = posOverride && typeof posOverride.z === 'number' ? posOverride.z : 0;
    content.XScale = 1;
    content.YScale = 1;
    content.ZScale = 1;

    HSCore.Util.Content.addContent({
      content: content,
      host: targetFloor,
      parent: app.floorplan.scene.activeLayer
    });

    await attachSkyProDisplay(content, item, checkedPartNames, {}, false);

    lastInsertedContent = content;
    app.selectionManager.unselectAll();
    app.selectionManager.select(content);

    return {
      contentId: content.id,
      content: content,
      XLength: built.XLength,
      YLength: built.YLength,
      ZLength: built.ZLength,
      cmSize: Math.round(built.XLength * 100) + '×' + Math.round(built.YLength * 100) + '×' + Math.round(built.ZLength * 100) + ' см'
    };
  };

  // ============================================================================
  // UNIVERSAL HIT DETECTION & MATERIAL PAINTING (WALLS, CABINETS, NATIVE & 3DSKY)
  // ============================================================================
  const findHitMeshComponent = (disp, e, mcs) => {
    if (!mcs || mcs.length === 0) return null;
    if (e && e.hitMc && mcs.includes(e.hitMc)) return e.hitMc;
    if (mcs.length === 1) return mcs[0];

    const targetName = (e && e.meshName)
      || (e && e.pickResults && e.pickResults[0] && e.pickResults[0].meshName)
      || (disp && disp.hoverNode && disp.hoverNode.getName && disp.hoverNode.getName());
    if (targetName) {
      const byName = mcs.find(c => c.mOwnerNode && (c.mOwnerNode.getName() === targetName || c.mOwnerNode.mName === targetName));
      if (byName) return byName;
    }

    const targetId = (e && e.meshId) || (e && e.pickResults && e.pickResults[0] && e.pickResults[0].meshId);
    if (targetId != null) {
      const byId = mcs.find(c =>
        (c.getRuntimeID && c.getRuntimeID() === targetId) ||
        (c.mOwnerNode && c.mOwnerNode.getRuntimeID && c.mOwnerNode.getRuntimeID() === targetId) ||
        (c.getMesh && c.getMesh() && c.getMesh().getRuntimeID && c.getMesh().getRuntimeID() === targetId)
      );
      if (byId) return byId;
    }

    const pos = (e && e.modelPos) || (e && e.pickResults && e.pickResults[0] && (e.pickResults[0].modelPos || e.pickResults[0].point));
    if (pos && typeof pos.x === 'number') {
      // T3D world space is X-right, Y-up, Z-back
      const wx = pos.x;
      const wy = pos.z != null ? pos.z : (pos.y || 0);
      const wz = pos.z != null ? -pos.y : 0;
      let bestMc = null, bestDist = Infinity;
      mcs.forEach(c => {
        const wbb = c.mOwnerNode && c.mOwnerNode.getWorldBoundingBox && c.mOwnerNode.getWorldBoundingBox();
        if (wbb && wbb.min && wbb.max) {
          const dx = Math.max(wbb.min.x - wx, 0, wx - wbb.max.x);
          const dy = Math.max(wbb.min.y - wy, 0, wy - wbb.max.y);
          const dz = Math.max(wbb.min.z - wz, 0, wz - wbb.max.z);
          const dist = Math.hypot(dx, dy, dz);
          if (dist < bestDist) {
            bestDist = dist;
            bestMc = c;
          }
        }
      });
      if (bestMc) return bestMc;
    }

    return mcs[0];
  };

  window.__applyMaterialDataToAnyEntity = (e, t) => {
    const ent = e && e.entity;
    const md = t && t.materialData;
    const v3d = app.getActive3DView();
    if (!ent || !md || !v3d) return;

    const disp = v3d.displayList[ent.id];
    const smartSpec = (md._smartSpec) || (md.seekId && SMART_SPECS[md.seekId]) || detectSmartSpecFromSeekOrUrl(md.seekId, md.textureURI || md.textureUrl) || CODE_TO_SPEC[md.shininess] || null;
    const isClearSmart = md._clearSmart === true;

    // 1. If SkyPro model, preserve full SkyPro material group painting + SmartSpec support
    if (ent._skyProId && disp && disp._modelNode) {
      const mcs = collectNodeMcs(disp._modelNode);
      const hitMc = findHitMeshComponent(disp, e, mcs);
      if (!hitMc) return;

      const hitMat = hitMc.getMaterial();
      const hitDefaultMatName = hitMat && hitMat._defaultMatName;

      const applySkyPro = async () => {
        let newMat;
        if (md._skyProSourceInfo) {
          newMat = createPhongMatFromInfo(md._skyProSourceInfo, 1.0, 0);
        } else {
          let loadedTex = null;
          const repX = md.tileSize_x ? (1 / md.tileSize_x) : 1;
          const repY = md.tileSize_y ? (1 / md.tileSize_y) : 1;
          if (md.textureURI && !smartSpec) {
            try {
              let uri = md.textureURI;
              if (uri.startsWith('http')) uri = await fetchAsDataUrl(uri);
              loadedTex = await window.ResourceManager.load(uri, window.HSApp.Io.Load.LoadTypeEnum.T3dContentTexture, {
                wrap: 1000,
                repeatX: repX,
                repeatY: repY,
                skipCache: true
              });
            } catch (err) {}
          }
          const mInfo = {
            name: md.name || (smartSpec ? smartSpec.name : 'CustomMaterial'),
            baseColor: [((md.color >> 16) & 255) / 255, ((md.color >> 8) & 255) / 255, (md.color & 255) / 255],
            _baseColorDataUrl: smartSpec ? '' : (md.textureURI || ''),
            _loadedBaseTex: loadedTex,
            _loadedNormalTex: smartSpec ? null : ((hitMat && hitMat.mNormalTexture) || null),
            _uvScale: [repX, repY],
            roughness: 0.6,
            metallic: 0.0,
            _smartSpec: isClearSmart ? null : smartSpec
          };
          newMat = createPhongMatFromInfo(mInfo, 1.0, md.rotation || 0);
        }

        if (!ent._skyProPaintedMaterials) {
          Object.defineProperty(ent, '_skyProPaintedMaterials', { value: {}, writable: true, enumerable: false, configurable: true });
        }

        mcs.forEach(mc => {
          const nm = mc.mOwnerNode ? mc.mOwnerNode.mName : '';
          const m = mc.getMaterial();
          const sameGroup = hitDefaultMatName && m && m._defaultMatName === hitDefaultMatName;
          if (mc === hitMc || sameGroup) {
            newMat._defaultMatName = (m && m._defaultMatName) || hitDefaultMatName || '';
            mc.setMaterial(newMat);
            applySmartSpecToMeshComponent(mc, isClearSmart ? null : smartSpec, ent.id);
            if (nm) ent._skyProPaintedMaterials[nm] = newMat;
          }
        });

        lastPaintedMeshComponent = hitMc;
        if (ent.displayName && skyProRegistry.has(ent.displayName)) {
          skyProRegistry.get(ent.displayName).paintedMaterials = Object.assign({}, ent._skyProPaintedMaterials);
        }
        if (disp.dirtyGraph) disp.dirtyGraph();
        if (v3d.context) v3d.context.needsRendering = true;
      };
      applySkyPro();
      return;
    }

    // 2. Any other entity (Wall/Floor/Ceiling HSCore.Model.Face, Cabinet CustomizedPMInstanceModel, Native Content)
    if (disp && disp.node) {
      const mcs = collectNodeMcs(disp.node);
      if (mcs.length > 0) {
        const isWallOrFace = ent instanceof HSCore.Model.Face;
        const targetMcs = isWallOrFace ? mcs : [findHitMeshComponent(disp, e, mcs)].filter(Boolean);
        targetMcs.forEach(mc => {
          if (smartSpec || isClearSmart) {
            applySmartSpecToMeshComponent(mc, isClearSmart ? null : smartSpec, ent.id);
          } else {
            const mat = mc.getMaterial && mc.getMaterial();
            if (mat) {
              applySmartSpecToMeshComponent(mc, null, ent.id);
              if (md.color != null && mat.setColor) mat.setColor(md.color);
            }
          }
          lastPaintedMeshComponent = mc;
        });
        if (disp.dirtyGraph) disp.dirtyGraph();
        if (v3d.context) v3d.context.needsRendering = true;
      }
    }
  };

  window.__applyMaterialDataToSkyProEntity = window.__applyMaterialDataToAnyEntity;

  const createSmartMaterialData = (specOrNull) => {
    if (!specOrNull) {
      const md = HSCore.Material.MaterialData.create({
        seekId: 'local',
        color: 0xffffff,
        textureURI: '',
        tileSize_x: 1,
        tileSize_y: 1,
        colorMode: HSCore.Material.ColorModeEnum.color
      });
      Object.defineProperty(md, '_clearSmart', { value: true, enumerable: false, configurable: true });
      return md;
    }
    const md = HSCore.Material.MaterialData.create({
      seekId: specOrNull.seekId,
      name: specOrNull.name,
      color: specOrNull.color,
      textureURI: '',
      tileSize_x: 1,
      tileSize_y: 1,
      colorMode: HSCore.Material.ColorModeEnum.color
    });
    Object.defineProperty(md, '_smartSpec', { value: specOrNull, enumerable: false, configurable: true });
    return md;
  };

  // Register Universal Strategy at index 0 of Homestyler MaterialBrush Plugin
  const registerUniversalBrushStrategy = () => {
    try {
      const mbPlugin = app.pluginManager.plugins['hsw.plugin.materialbrush.Plugin'];
      if (mbPlugin && mbPlugin._handler) {
        const h = mbPlugin._handler;
        h._strategies = (h._strategies || []).filter(s => s.type !== 'SkyProContentStrategy' && s.type !== 'SmartUniversalStrategy');
        const univStrategy = {
          type: 'SmartUniversalStrategy',
          isSuckable(e) {
            if (!e || !e.entity) return false;
            if (e.entity._skyProId) return true;
            const v3d = app.getActive3DView();
            const disp = v3d && v3d.displayList[e.entity.id];
            if (disp && disp.node) {
              const mcs = collectNodeMcs(disp.node);
              const hitMc = findHitMeshComponent(disp, e, mcs);
              const mat = hitMc && hitMc.getMaterial && hitMc.getMaterial();
              if (mat && mat._smartSpec) return true;
            }
            return false;
          },
          suck(e) {
            const ent = e.entity;
            const v3d = app.getActive3DView();
            const disp = v3d && v3d.displayList[ent.id];
            if (disp && disp.node) {
              const mcs = collectNodeMcs(disp.node);
              const hitMc = findHitMeshComponent(disp, e, mcs);
              if (hitMc) {
                const mat = hitMc.getMaterial();
                if (mat && mat._smartSpec) {
                  return { materialData: createSmartMaterialData(mat._smartSpec) };
                }
                if (ent._skyProId) {
                  const info = mat && mat._skyProMatInfo;
                  const hexColor = info ? rgbToHexInt(info.baseColor) : (mat && mat.mColor ? mat.mColor : 0xffffff);
                  const texUri = (info && info._baseColorDataUrl) || '';
                  const uv = (info && info._uvScale) || [1, 1];
                  const md = HSCore.Material.MaterialData.create({
                    seekId: 'local',
                    color: hexColor,
                    textureURI: texUri,
                    tileSize_x: uv[0] ? (1 / uv[0]) : 0.5,
                    tileSize_y: uv[1] ? (1 / uv[1]) : 0.5,
                    colorMode: texUri ? HSCore.Material.ColorModeEnum.texture : HSCore.Material.ColorModeEnum.color
                  });
                  Object.defineProperty(md, '_skyProSourceInfo', { value: info || null, enumerable: false, configurable: true });
                  return { materialData: md };
                }
              }
            }
            return false;
          },
          isAppliable(e, t) {
            if (!e || !e.entity || !t || !t.materialData) return false;
            const md = t.materialData;
            if (md._smartSpec || md._clearSmart || SMART_SPECS[md.seekId] || detectSmartSpecFromSeekOrUrl(md.seekId, md.textureURI)) return true;
            return !!e.entity._skyProId;
          },
          apply(e, t) {
            window.__applyMaterialDataToAnyEntity(e, t);
          },
          commitRequest(e, t) {
            window.__applyMaterialDataToAnyEntity(e, t);
          },
          stopPreview() {},
          getUndoData() { return {}; },
          getRedoData() { return {}; },
          undo() {},
          redo() {}
        };
        h._strategies.unshift(univStrategy);
        const curCmd = app.cmdManager.current;
        if (curCmd && curCmd._strategies) {
          curCmd._strategies = curCmd._strategies.filter(s => s.type !== 'SkyProContentStrategy' && s.type !== 'SmartUniversalStrategy');
          curCmd._strategies.unshift(univStrategy);
        }
      }
    } catch (e) {}
  };
  registerUniversalBrushStrategy();

  const patchDecorationCommand = (cmd) => {
    if (!cmd || cmd._skyProPatchedV2) return;
    if (cmd.type !== window.HSFPConstants.CommandType.Decoration && cmd.type !== window.HSFPConstants.CommandType.DecorationEx) return;
    cmd._skyProPatchedV2 = true;
    const origCanPaint = cmd._origCanPaint || (cmd._origCanPaint = cmd.canPaint ? cmd.canPaint.bind(cmd) : () => false);
    const origOnReceive = cmd._origOnReceive || (cmd._origOnReceive = cmd.onReceive.bind(cmd));
    const isSmartMatActive = (cm) => !!(cm && (cm._smartSpec || SMART_SPECS[cm.seekId] || detectSmartSpecFromSeekOrUrl(cm.seekId, cm.textureURI || cm.textureUrl)));
    cmd.canPaint = function(ent, faceType) {
      if (ent && (ent._skyProId || isSmartMatActive(this.currentMaterial))) return true;
      return origCanPaint(ent, faceType);
    };
    cmd.onReceive = function(msg, data) {
      const ent = data && data.entity;
      if (ent && (ent._skyProId || isSmartMatActive(this.currentMaterial))) {
        if ((msg === 'click' || msg === 'dragEnd') && this.currentMaterial) {
          const md = HSCore.Material.MaterialData.create({
            seekId: this.currentMaterial.seekId || 'local',
            color: this.currentMaterial.color != null ? this.currentMaterial.color : 0xffffff,
            textureURI: this.currentMaterial.textureURI || this.currentMaterial.textureUrl || '',
            tileSize_x: this.currentMaterial.tileSize_x || 0.5,
            tileSize_y: this.currentMaterial.tileSize_y || 0.5,
            colorMode: (this.currentMaterial.textureURI || this.currentMaterial.textureUrl) ? HSCore.Material.ColorModeEnum.texture : HSCore.Material.ColorModeEnum.color
          });
          window.__applyMaterialDataToAnyEntity(data, { materialData: md });
          return true;
        }
        if (msg === 'mousemove') {
          this.updateCursorStatus && this.updateCursorStatus(ent, null);
          this.renderMiniImagePreview && this.renderMiniImagePreview(data);
          return true;
        }
      }
      return origOnReceive(msg, data);
    };
  };
  if (app.cmdManager && app.cmdManager.current) {
    patchDecorationCommand(app.cmdManager.current);
  }

  // Support standard Homestyler Duplicate (Ctrl+C/Ctrl+V) AND Alt+Drag duplication + CmdDecoration hook
  if (!window.__skyProChildAddedHooked) {
    window.__skyProChildAddedHooked = true;
    app.floorplan.scene.activeLayer.signalChildAdded.listen((ev) => {
      const child = ev && ev.data && ev.data.entity;
      if (!child || !(child instanceof HSCore.Model.Content)) return;
      setTimeout(() => {
        if (child._skyProId) return;
        const reg = skyProRegistry.get(child.displayName) || (lastInsertedContent && lastInsertedContent._skyProItem && child.seekId === lastInsertedContent.seekId ? {
          item: lastInsertedContent._skyProItem,
          checkedPartNames: lastInsertedContent._skyProCheckedParts,
          paintedMaterials: lastInsertedContent._skyProPaintedMaterials
        } : null);
        if (reg && reg.item) {
          attachSkyProDisplay(child, reg.item, reg.checkedPartNames, reg.paintedMaterials, true);
        }
      }, 60);
    });

    window.__skyProAltDown = false;
    window.addEventListener('keydown', (e) => { if (e.key === 'Alt' || e.keyCode === 18) window.__skyProAltDown = true; }, true);
    window.addEventListener('keyup', (e) => { if (e.key === 'Alt' || e.keyCode === 18) window.__skyProAltDown = false; }, true);
    window.addEventListener('mousedown', (e) => { window.__skyProAltDown = !!e.altKey; }, true);
  }

  try {
    const sig = app.cmdManager && app.cmdManager.signalCommandStarted;
    if (sig && Array.isArray(sig._eventsCallback)) {
      sig._eventsCallback = sig._eventsCallback.filter(cb => {
        const s = String((cb && (cb.fn || cb.callback)) || cb || '');
        return !s.includes('registerUniversalBrushStrategy');
      });
    }
  } catch (e) {}

  {
    app.cmdManager.signalCommandStarted.listen((ev) => {
      const cmd = ev && ev.data && ev.data.cmd;
      if (!cmd) return;
      registerUniversalBrushStrategy();
      patchDecorationCommand(cmd);

      if (window.__skyProAltDown && (cmd.type === window.HSFPConstants.CommandType.MoveContent || cmd.type === window.HSFPConstants.CommandType.MoveContents)) {
        const sel = app.selectionManager.selected()[0] || cmd.content;
        if (sel && sel._skyProItem && !sel._altClonedInThisDrag) {
          sel._altClonedInThisDrag = true;
          const origPos = { x: sel.x, y: sel.y, z: sel.z, XRotation: sel.XRotation, YRotation: sel.YRotation, ZRotation: sel.ZRotation, XScale: sel.XScale, YScale: sel.YScale, ZScale: sel.ZScale };
          const item = sel._skyProItem;
          const parts = sel._skyProCheckedParts;
          const painted = Object.assign({}, sel._skyProPaintedMaterials || {});
          setTimeout(async () => {
            sel._altClonedInThisDrag = false;
            if (Math.hypot(sel.x - origPos.x, sel.y - origPos.y, sel.z - origPos.z) > 0.02) {
              let targetFloor = null;
              app.floorplan.scene.activeLayer.forEachFloor(fl => { if (!targetFloor) targetFloor = fl; });
              const cloneMeta = sel.metadata.clone();
              const cloneContent = HSCore.Model.Content.create(cloneMeta);
              cloneContent.displayName = item.title;
              cloneContent.x = origPos.x;
              cloneContent.y = origPos.y;
              cloneContent.z = origPos.z;
              cloneContent.XLength = sel.XLength;
              cloneContent.YLength = sel.YLength;
              cloneContent.ZLength = sel.ZLength;
              cloneContent.XScale = origPos.XScale;
              cloneContent.YScale = origPos.YScale;
              cloneContent.ZScale = origPos.ZScale;
              cloneContent.XRotation = origPos.XRotation;
              cloneContent.YRotation = origPos.YRotation;
              cloneContent.ZRotation = origPos.ZRotation;
              HSCore.Util.Content.addContent({
                content: cloneContent,
                host: targetFloor,
                parent: app.floorplan.scene.activeLayer
              });
              await attachSkyProDisplay(cloneContent, item, parts, painted, true);
            }
          }, 350);
        }
      }
    });
  }

  // Interactive 1-Click Smart Brush Mode on 3D Viewport via Direct Raycaster (hits CustomizedPMInstanceModel cabinets, LED strips, walls, and 3D models!)
  window.__activeSmartBrushSpec = undefined; // undefined = off, null = clear to normal, object = spec
  const getMcVolume = (mc) => {
    try {
      const wbb = mc && mc.mOwnerNode && mc.mOwnerNode.getWorldBoundingBox && mc.mOwnerNode.getWorldBoundingBox();
      if (wbb && wbb.min && wbb.max) {
        return Math.max(0.001, (wbb.max.x - wbb.min.x)) * Math.max(0.001, (wbb.max.y - wbb.min.y)) * Math.max(0.001, (wbb.max.z - wbb.min.z));
      }
    } catch (e) {}
    return 999999;
  };

  const raycastSmartBrushTarget = (clientX, clientY) => {
    const v3d = app.getActive3DView();
    if (!v3d || !v3d.selector || !v3d.selector.picker || !v3d.domElement) return null;
    const rect = v3d.domElement.getBoundingClientRect();
    if (clientX < rect.left || clientY < rect.top || clientX > rect.right || clientY > rect.bottom) return null;

    const picker = v3d.selector.picker;
    const sc = picker.screenToCanvas(clientX, clientY);
    const ray = picker.getRay(sc.x, sc.y);
    picker.raycaster.set(ray.getOrigin(), ray.getDirection());

    const candidates = [];

    // 1. Native Homestyler picker across all layers (handles CustomizedPMInstanceModel streaming meshes, Walls, Faces, Content)
    try {
      const layerIds = Object.keys(picker.trackingNodes || {});
      const nativeHits = picker.pick(sc.x, sc.y, layerIds, true) || [];
      for (const p of nativeHits) {
        const disp = p && p.viewObject;
        const ent = disp && disp.entity;
        if (!ent || !disp || !disp.node) continue;
        const cls = String(ent.Class || (ent.constructor && ent.constructor.name) || '');
        if (/Layer|Scene|CustomizedPMModel$/i.test(cls)) continue;
        const mcs = collectNodeMcs(disp.node);
        const hitMc = findHitMeshComponent(disp, p, mcs);
        if (hitMc) {
          candidates.push({
            entity: ent,
            disp,
            hitMc,
            meshName: p.meshName || (hitMc.mOwnerNode && hitMc.mOwnerNode.mName) || '',
            point: p.point || p.modelPos,
            distance: p.distance != null ? p.distance : 999
          });
        }
      }
    } catch (e) {}

    // 2. Direct T3D raycaster for custom 3DSky Pro GLB meshes and any displayList nodes
    const allMcs = [];
    const nodeToMcDisp = new Map();
    for (const disp of Object.values(v3d.displayList || {})) {
      if (!disp || !disp.node || !disp.entity) continue;
      const cls = String(disp.entity.Class || (disp.entity.constructor && disp.entity.constructor.name) || '');
      if (/Layer|Scene|CustomizedPMModel$/i.test(cls)) continue;
      if (disp.__hiddenFromWallHide || disp.__hiddenFromWallFaceHide || disp._visible === false) continue;
      if (disp.node.mVisible === false) continue;
      const mcs = collectNodeMcs(disp.node);
      for (let i = 0; i < mcs.length; i++) {
        const mc = mcs[i];
        if (mc.mOwnerNode && mc.mOwnerNode.mVisible !== false) {
          allMcs.push(mc);
          nodeToMcDisp.set(mc.mOwnerNode, { mc, disp });
        }
      }
    }

    const hits = picker.raycaster.hitMeshComponents(allMcs, true) || [];
    for (const h of hits) {
      const hitNode = h.node || (h.meshComponent && h.meshComponent.mOwnerNode);
      const pair = hitNode && nodeToMcDisp.get(hitNode);
      if (pair && pair.disp && pair.disp.entity) {
        candidates.push({
          entity: pair.disp.entity,
          disp: pair.disp,
          hitMc: pair.mc,
          meshName: hitNode.mName || (hitNode.getName && hitNode.getName()) || '',
          point: h.point,
          distance: h.distance != null ? h.distance : 999
        });
      }
    }

    if (!candidates.length) return null;
    candidates.sort((a, b) => {
      const dDiff = (a.distance || 0) - (b.distance || 0);
      if (Math.abs(dDiff) < 0.045) {
        return getMcVolume(a.hitMc) - getMcVolume(b.hitMc);
      }
      return dDiff;
    });
    return candidates[0];
  };

  const hook3DViewMouseEventsForSmartBrush = () => {
    const v3d = app.getActive3DView();
    if (!v3d || !v3d.domElement) return;
    const dom = v3d.domElement;
    if (dom.__smartBrushDomListener) {
      dom.removeEventListener('pointerdown', dom.__smartBrushDomDown, true);
      dom.removeEventListener('pointerup', dom.__smartBrushDomListener, true);
    }
    let downX = 0, downY = 0;
    dom.__smartBrushDomDown = (ev) => {
      downX = ev.clientX;
      downY = ev.clientY;
      if (ev.button === 2 && window.__activeSmartBrushSpec !== undefined) {
        window.__activeSmartBrushSpec = undefined;
        if (window.__syncSmartBrushOffUI) window.__syncSmartBrushOffUI('Кисть выключена');
      }
    };
    dom.__smartBrushDomListener = (ev) => {
      if (window.__activeSmartBrushSpec === undefined) return;
      if (ev.button !== 0) return;
      if (Math.hypot(ev.clientX - downX, ev.clientY - downY) > 6) return; // Ignore camera orbit drags
      const specToApply = window.__activeSmartBrushSpec;
      const hit = raycastSmartBrushTarget(ev.clientX, ev.clientY);
      if (hit && hit.entity) {
        if (specToApply === null) {
          if (hit.hitMc) {
            applySmartSpecToMeshComponent(hit.hitMc, null, hit.entity.id);
          } else {
            window.__clearAllSmartMaterialsOnEntity(hit.entity);
          }
          if (hit.disp && hit.disp.dirtyGraph) hit.disp.dirtyGraph();
          if (v3d.renderingMgr) v3d.renderingMgr.needUpdate = true;
          if (v3d.context) v3d.context.needsRendering = true;
        } else {
          const md = createSmartMaterialData(specToApply);
          window.__applyMaterialDataToAnyEntity(hit, { materialData: md });
        }
        // Auto-turn off 1-click brush immediately after painting/clearing so normal scene clicks never paint accidentally!
        window.__activeSmartBrushSpec = undefined;
        if (window.__onSmartMaterialAppliedUI) {
          window.__onSmartMaterialAppliedUI(hit.entity, specToApply, hit.meshName);
        }
        ev.stopPropagation();
      }
    };
    dom.addEventListener('pointerdown', dom.__smartBrushDomDown, true);
    dom.addEventListener('pointerup', dom.__smartBrushDomListener, true);
  };
  hook3DViewMouseEventsForSmartBrush();

  // ============================================================================
  // TASK 2B: NATIVE HOMESTYLER 3D MODEL UPLOAD & SCENE REPLACEMENT PIPELINE
  // ============================================================================
  const callHomestylerMtop = (api, data = {}, method = 'get') => {
    return window.NWTK.mtop.Upload.generateOssAuthorizationInfo({
      data,
      options: { api, type: method }
    });
  };

  const makeUuid = () => {
    if (crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  };

  const replaceEntityWithSeekId = async (targetEntity, finalSeekId, prog) => {
    const prodMeta = await app.catalogManager.getProductBySeekId(finalSeekId);
    if (prodMeta) {
      let targetFloor = null;
      app.floorplan.scene.activeLayer.forEachFloor(fl => {
        if (!targetFloor) targetFloor = fl;
      });
      const cam = app.floorplan.active_camera;
      let cx = cam ? (cam.target_x || 0) : 0;
      let cy = cam ? (cam.target_y || 0) : 0;
      if (cam && typeof cam.x === 'number' && typeof cam.y === 'number') {
        const dx = cx - cam.x, dy = cy - cam.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 0.2) {
          const pd = Math.min(Math.max(dist * 0.65, 1.25), 2.0);
          cx = cam.x + (dx / dist) * pd;
          cy = cam.y + (dy / dist) * pd;
        }
      }

      const hasValidTarget = targetEntity && typeof targetEntity.x === 'number';
      const pos = {
        x: hasValidTarget ? targetEntity.x : cx,
        y: hasValidTarget ? targetEntity.y : cy,
        z: hasValidTarget ? (targetEntity.z || 0) : 0,
        XRotation: hasValidTarget ? (targetEntity.XRotation || 0) : 0,
        YRotation: hasValidTarget ? (targetEntity.YRotation || 0) : 0,
        ZRotation: hasValidTarget ? (targetEntity.ZRotation || 0) : 0,
        XScale: hasValidTarget ? (targetEntity.XScale || 1) : 1,
        YScale: hasValidTarget ? (targetEntity.YScale || 1) : 1,
        ZScale: hasValidTarget ? (targetEntity.ZScale || 1) : 1,
        host: (hasValidTarget && targetEntity.getHost && targetEntity.getHost()) || targetFloor,
        parent: (hasValidTarget && targetEntity.getUniqueParent && targetEntity.getUniqueParent()) || app.floorplan.scene.activeLayer
      };

      const nativeContent = HSCore.Model.Content.create(prodMeta);
      nativeContent.x = pos.x;
      nativeContent.y = pos.y;
      nativeContent.z = pos.z;
      nativeContent.XRotation = pos.XRotation;
      nativeContent.YRotation = pos.YRotation;
      nativeContent.ZRotation = pos.ZRotation;
      nativeContent.XScale = pos.XScale;
      nativeContent.YScale = pos.YScale;
      nativeContent.ZScale = pos.ZScale;

      if (hasValidTarget) {
        try { HSCore.Util.Content.removeContent(targetEntity); } catch (e) {}
      }
      HSCore.Util.Content.addContent({
        content: nativeContent,
        host: pos.host,
        parent: pos.parent
      });
      app.selectionManager.unselectAll();
      app.selectionManager.select(nativeContent);
      lastInsertedContent = nativeContent;
      prog(`✓ Готово! Заменено на настоящую модель Homestyler (${finalSeekId.slice(0, 8)}…) для рендера!`);
      return true;
    }
    prog(`✓ Нативная модель доступна в «Мои загрузки» (${finalSeekId.slice(0, 8)}…)!`);
    return false;
  };

  window.__convertSkyProToNativeHomestylerModel = async (item, checkedPartNames, targetEntity, onProgress) => {
    const prog = (msg) => { if (onProgress) onProgress(msg); };
    const modelTitle = ((item.title || item.label || item.id) + '').slice(0, 80);

    // 0. Check if this model is ALREADY converted & ready in "Мои загрузки"
    try {
      const checkRes = await window.NWTK.mtop.Catalog.getCustomizedProducts({
        data: {
          offset: 0,
          limit: 20,
          category: 'b2eed62d-0cd8-3d90-8516-3fef86d9bec1',
          text: '',
          processStatus: 1,
          excludeAiGenerateModel: 1,
          tenant: 'fp',
          lang: 'ru_RU',
          branch: ''
        }
      });
      const existingItems = (checkRes && checkRes.data && checkRes.data.items) || [];
      const readyMatch = existingItems.find(it =>
        it.name === modelTitle &&
        (it.postProcessingStatus === 'value-postProcessingStatus-success' || it.status === 1)
      );
      if (readyMatch && readyMatch.id) {
        prog(`Найдена готовая нативная модель в «Мои загрузки» (${readyMatch.id.slice(0, 8)}…), заменяем...`);
        await replaceEntityWithSeekId(targetEntity, readyMatch.id, prog);
        return { ok: true, seekId: readyMatch.id, cached: true };
      }
    } catch (e) {}

    prog('1/4 Упаковка выбранных частей и PBR-текстур в .GLB для Homestyler...');

    const paintedOverrides = {};
    if (targetEntity && targetEntity._skyProPaintedMaterials) {
      for (const [partName, pMat] of Object.entries(targetEntity._skyProPaintedMaterials)) {
        const info = pMat && pMat._skyProMatInfo;
        if (info) {
          paintedOverrides[partName] = {
            baseColor: info.baseColor || [0.85, 0.85, 0.85],
            textureDataUrl: info._baseColorDataUrl || '',
            uvScale: [
              ((info._uvScale && info._uvScale[0]) || 1) * (pMat._userScaleMul || 1),
              ((info._uvScale && info._uvScale[1]) || 1) * (pMat._userScaleMul || 1)
            ]
          };
        }
      }
    }

    const expResp = await fetch(SERVER_ORIGIN + '/api/export-native-zip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: item.id,
        checkedParts: Array.from(checkedPartNames || []),
        paintedOverrides
      })
    });
    const expData = await expResp.json();
    const b64Payload = expData && (expData.glbBase64 || expData.zipBase64);
    if (!expData || !expData.ok || !b64Payload) {
      throw new Error((expData && expData.error) || 'Не удалось подготовить 3D-файл');
    }

    prog(`2/4 Загрузка 3D-модели (${expData.zipSizeKB} КБ, ${expData.keptCount} ч.) в облако Homestyler...`);
    const signRes = await callHomestylerMtop('mtop.com.tpsjj.service.oss.sign.global', {}, 'get');
    const signInfo = signRes && signRes.data && signRes.data.result;
    if (!signInfo || !signInfo.accessId || !signInfo.policy || !signInfo.signature) {
      throw new Error('Не удалось получить OSS-подпись Homestyler (проверьте авторизацию)');
    }

    const binStr = atob(b64Payload);
    const bytes = new Uint8Array(binStr.length);
    for (let i = 0; i < binStr.length; i++) bytes[i] = binStr.charCodeAt(i);
    const isGlb = expData.format === 'glb' || (expData.fileName && expData.fileName.endsWith('.glb'));
    const fileBlob = new Blob([bytes], { type: isGlb ? 'model/gltf-binary' : 'application/zip' });

    const dirPrefix = signInfo.dir || ('i/' + makeUuid());
    const ossKey = `${dirPrefix}/${makeUuid()}.model.max.${isGlb ? 'glb' : 'zip'}`;
    const ossHost = signInfo.endpoint || 'https://hs-prod-pim-products.oss-us-east-1.aliyuncs.com';

    const fd = new FormData();
    fd.append('OSSAccessKeyId', signInfo.accessId);
    fd.append('policy', signInfo.policy);
    fd.append('signature', signInfo.signature);
    fd.append('dir', signInfo.dir || '');
    if (signInfo.callback) fd.append('callback', signInfo.callback);
    fd.append('key', ossKey);
    fd.append('success_action_status', '200');
    fd.append('file', fileBlob, isGlb ? 'model.glb' : `${item.id}.zip`);

    const ossUploadResp = await fetch(ossHost, {
      method: 'POST',
      body: fd
    });
    if (!ossUploadResp.ok && ossUploadResp.status !== 200) {
      throw new Error('Ошибка загрузки в OSS: HTTP ' + ossUploadResp.status);
    }

    const ossUrl = `http://hs-prod-pim-products.oss-us-east-1.aliyuncs.com/${ossKey}`;
    const ossAccelUrl = `http://hs-prod-pim-products.oss-accelerate.aliyuncs.com/${ossKey}`;

    prog('3/4 Регистрация нативной 3D-модели в каталоге Homestyler...');
    try {
      await callHomestylerMtop('mtop.com.tpsjj.service.product.3d.precheck.global', {
        maxUrls: JSON.stringify([ossAccelUrl])
      }, 'get');
    } catch (e) {}

    const leafCategoryId = 'ca4c0a8a-0f2f-4217-a5b9-42692156290b';
    const modelPayload = {
      tempId: '',
      jid: '',
      needUpload: true,
      unit: expData.unit || (isGlb ? 'm' : 'cm'),
      dataType: 'TYPE_3D',
      modelType: 'Normal',
      name: modelTitle,
      properties: {
        category_id: leafCategoryId,
        brand_id: '0',
        brand_name: '通配',
        sub_type: '3D'
      },
      features: {
        color_remark: ''
      },
      ipRight: 'PRIVATE',
      files: [
        { metaType: '3ds', url: ossUrl }
      ],
      subFiles: [],
      modelAssetData: {
        category: leafCategoryId,
        attributes: [
          {
            id: 'dbd9b78c-fbae-4931-ac30-ff218059b3c6',
            valuesIds: ['fc71fc35-70bf-4edf-85c0-09da9fa22aa2'],
            free: [],
            name: 'ContentType'
          },
          {
            id: '9760302e-698a-4a18-8872-72f6ae9568bb',
            valuesIds: ['4b3ec1a2-5ed1-4a31-a1b3-82ec5e77e089'],
            free: [],
            name: 'zindex'
          },
          {
            id: 'f2ebc921-291a-42c6-be8d-e6f3019672fb',
            valuesIds: ['001e1123-52fb-42d4-a4fe-beffc201084a'],
            free: [],
            name: 'AssetType'
          },
          {
            id: 'd84e3ec7-d39a-471e-8f39-58f645e209ef',
            valuesIds: ['f7a2e788-611f-459a-908d-dadd483699d9'],
            free: [],
            name: 'isScalable'
          }
        ]
      }
    };

    const submitRes = await callHomestylerMtop('mtop.com.tpsjj.service.product.modelupload.global', {
      channel: 'model-uploader',
      tenant: 'hsm',
      model: JSON.stringify(modelPayload)
    }, 'post');

    const submitData = submitRes && submitRes.data;
    if (!submitData || submitData.code !== 'SUCCESS') {
      throw new Error((submitData && submitData.message) || 'Ошибка отправки modelupload.global');
    }

    const aliModelId = submitData.result ? String(submitData.result) : null;
    prog('4/4 Модель отправлена на сервер Homestyler! Ожидаем автозамену (1–2 мин)...');

    const pollAndReplace = async () => {
      for (let step = 1; step <= 60; step++) {
        await new Promise(r => setTimeout(r, 4000));
        try {
          const searchRes = await window.NWTK.mtop.Catalog.getCustomizedProducts({
            data: {
              offset: 0,
              limit: 15,
              category: 'b2eed62d-0cd8-3d90-8516-3fef86d9bec1',
              text: '',
              processStatus: 1,
              excludeAiGenerateModel: 1,
              tenant: 'fp',
              lang: 'ru_RU',
              branch: ''
            }
          });
          const items = (searchRes && searchRes.data && (searchRes.data.items || searchRes.data.result)) || [];
          const match = items.find(it =>
            (aliModelId && String(it.aliModelId) === aliModelId) ||
            (it.name === modelTitle)
          );
          if (match) {
            const st = String(match.postProcessingStatus || '');
            if (st === 'value-postProcessingStatus-success' || match.status === 1) {
              const finalSeekId = match.id;
              prog(`✓ Нативная модель готова (${finalSeekId.slice(0, 8)}…)! Заменяем в сцене...`);
              await replaceEntityWithSeekId(targetEntity, finalSeekId, prog);
              return finalSeekId;
            } else if (st.includes('fail') || st.includes('error')) {
              const errCode = (match.references && match.references.others && match.references.others.errorCode) || '';
              prog(`⚠ Сервер Homestyler вернул ошибку конвертации (${errCode || st})`);
              return null;
            } else {
              prog(`⏳ Сервер Homestyler конвертирует 3D-модель (${step * 4} сек)... Не запускайте облачный рендер до сообщения «✓ Готово!».`);
            }
          }
        } catch (err) {}
      }
      prog('⏳ Модель ещё обрабатывается в «Мои загрузки» (нажмите кнопку ещё раз через минуту для мгновенной замены).');
      return aliModelId;
    };

    pollAndReplace();
    return { ok: true, aliModelId, zipSizeKB: expData.zipSizeKB, keptCount: expData.keptCount };
  };

  const getOneItemPartNames = async (item) => {
    const nonBalls = (item.parts || []).filter(p => !(p.isMaterialBallCandidate || p.isBall));
    if (nonBalls.length <= 1) return nonBalls.map(p => p.name);
    try {
      const res = await loadModelResources(item);
      const nodes = (res.nodesMeta || []).filter(n => !n.isMaterialBallCandidate && n.bbox && n.bbox.min && n.bbox.max);
      if (nodes.length > 0) {
        const n0 = nodes[0];
        const cx0 = 0.5 * (n0.bbox.min[0] + n0.bbox.max[0]);
        const cy0 = 0.5 * (n0.bbox.min[1] + n0.bbox.max[1]);
        const cluster = nodes.filter(n => {
          const cx = 0.5 * (n.bbox.min[0] + n.bbox.max[0]);
          const cy = 0.5 * (n.bbox.min[1] + n.bbox.max[1]);
          return Math.hypot(cx - cx0, cy - cy0) < 280;
        });
        if (cluster.length === nonBalls.length && item.id === '5871417.65527773d76e7') {
          return [nonBalls[0].name];
        }
        if (cluster.length > 0) {
          const clusterNames = new Set(cluster.map(c => c.name));
          const matched = nonBalls.filter(p => clusterNames.has(p.name) || Array.from(clusterNames).some(cn => cn.startsWith(p.name.slice(0, 20)))).map(p => p.name);
          if (matched.length > 0) return matched;
        }
      }
    } catch (e) {}
    return [nonBalls[0].name];
  };

  // ============================================================================
  // UI PANEL: SMART MATERIALS BAR + RESIZABLE 3DSKY PRO CATALOG + NATIVE CONVERTER
  // ============================================================================
  const existingPanel = document.getElementById('skypro-hs-right-panel');
  if (existingPanel) existingPanel.remove();
  const existingToggle = document.getElementById('skypro-hs-toggle-btn');
  if (existingToggle) existingToggle.remove();

  const modelsResp = await fetch(SERVER_ORIGIN + '/api/models?t=' + Date.now());
  let models = await modelsResp.json();

  const panel = document.createElement('div');
  panel.id = 'skypro-hs-right-panel';
  panel.style.cssText = [
    'position:fixed',
    'top:54px',
    'right:258px',
    'width:308px',
    'height:calc(100vh - 104px)',
    'min-width:250px',
    'min-height:260px',
    'background:#ffffff',
    'border-radius:10px',
    'box-shadow:0 8px 28px rgba(15,23,42,0.22)',
    'border:1px solid #cbd5e1',
    'z-index:9999',
    'display:flex',
    'flex-direction:column',
    'font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
    'overflow:hidden',
    'box-sizing:border-box'
  ].join(';');

  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'skypro-hs-toggle-btn';
  toggleBtn.textContent = '3DSky + Спецматериалы';
  toggleBtn.style.cssText = [
    'position:fixed',
    'top:130px',
    'right:566px',
    'z-index:10000',
    'background:#2563eb',
    'color:#fff',
    'border:none',
    'border-radius:8px 0 0 8px',
    'padding:10px 6px',
    'writing-mode:vertical-rl',
    'font-size:11px',
    'font-weight:600',
    'cursor:pointer',
    'box-shadow:-2px 2px 10px rgba(37,99,235,0.28)'
  ].join(';');

  const syncToggleBtnPos = () => {
    const r = parseInt(panel.style.right || '258', 10);
    const t = parseInt(panel.style.top || '54', 10);
    const w = panel.offsetWidth || parseInt(panel.style.width || '308', 10);
    toggleBtn.style.top = Math.max(46, t + 64) + 'px';
    toggleBtn.style.right = (panel.style.display === 'none' ? r : (r + w)) + 'px';
  };

  let isOpen = true;
  let isMinimized = false;
  let savedHeightBeforeMin = 'calc(100vh - 104px)';

  toggleBtn.onclick = () => {
    isOpen = !isOpen;
    panel.style.display = isOpen ? 'flex' : 'none';
    syncToggleBtnPos();
  };

  panel.innerHTML = `
    <!-- 8-DIRECTION OUTER RESIZE HANDLES -->
    <div data-rdir="w" title="Тяните, чтобы изменить ширину" style="position:absolute;left:0;top:10px;bottom:10px;width:6px;cursor:ew-resize;z-index:20;"></div>
    <div data-rdir="e" title="Тяните, чтобы изменить ширину" style="position:absolute;right:0;top:10px;bottom:10px;width:6px;cursor:ew-resize;z-index:20;"></div>
    <div data-rdir="n" title="Тяните, чтобы изменить высоту" style="position:absolute;top:0;left:10px;right:10px;height:5px;cursor:ns-resize;z-index:20;"></div>
    <div data-rdir="s" title="Тяните, чтобы изменить высоту" style="position:absolute;bottom:0;left:10px;right:10px;height:6px;cursor:ns-resize;z-index:20;"></div>
    <div data-rdir="nw" style="position:absolute;left:0;top:0;width:11px;height:11px;cursor:nwse-resize;z-index:21;"></div>
    <div data-rdir="ne" style="position:absolute;right:0;top:0;width:11px;height:11px;cursor:nesw-resize;z-index:21;"></div>
    <div data-rdir="sw" style="position:absolute;left:0;bottom:0;width:11px;height:11px;cursor:nesw-resize;z-index:21;"></div>
    <div data-rdir="se" style="position:absolute;right:0;bottom:0;width:11px;height:11px;cursor:nwse-resize;z-index:21;"></div>

    <div id="skypro-drag-header" title="Потяните за шапку, чтобы передвинуть панель в любое место" style="padding:7px 10px;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;justify-content:space-between;cursor:move;background:#f8fafc;user-select:none;flex-shrink:0;">
      <div style="display:flex;align-items:center;gap:5px;overflow:hidden;">
        <span style="color:#94a3b8;font-size:12px;">⋮⋮</span>
        <span style="font-weight:700;font-size:12px;color:#0f172a;white-space:nowrap;">3DSky Pro + Материалы</span>
        <span id="skypro-count-badge" style="background:#eff6ff;color:#2563eb;font-size:10px;font-weight:600;padding:1px 6px;border-radius:10px;white-space:nowrap;">${models.length} шт.</span>
        <button id="skypro-refresh-btn" title="Обновить список моделей" style="border:none;background:none;color:#2563eb;cursor:pointer;font-size:12px;padding:0 2px;">🔄</button>
        <button id="skypro-batch-btn" title="Запустить / остановить фоновую пакетную конвертацию новых 3DSky моделей в GLB" style="border:1px solid #cbd5e1;background:#f1f5f9;color:#334155;cursor:pointer;font-size:10px;font-weight:600;padding:1px 5px;border-radius:4px;white-space:nowrap;">⚙ Пакет GLB</button>
      </div>
      <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
        <a href="https://lavinteriors.pro/viewer" target="_blank" style="font-size:10px;color:#2563eb;text-decoration:none;font-weight:600;white-space:nowrap;">Каталог ↗</a>
        <button id="skypro-min-btn" title="Свернуть / развернуть панель" style="border:1px solid #cbd5e1;background:#ffffff;color:#334155;border-radius:4px;width:20px;height:20px;line-height:16px;text-align:center;font-size:12px;font-weight:700;cursor:pointer;padding:0;">—</button>
      </div>
    </div>

    <div id="skypro-body-wrap" style="display:flex;flex-direction:column;flex:1;overflow:hidden;">
      <!-- SMART VIEWPORT MATERIALS BAR -->
      <div style="padding:6px 10px;background:linear-gradient(180deg,#f0f7ff 0%,#f8fafc 100%);border-bottom:1px solid #e2e8f0;flex-shrink:0;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
          <span style="font-size:10.5px;font-weight:700;color:#1e3a8a;">🎨 Спецматериалы (Вьюпорт):</span>
          <span id="smart-brush-indicator" style="font-size:9.5px;color:#64748b;font-weight:600;">Кисть: Выкл.</span>
        </div>
        <div id="smart-mat-btns-grid" style="display:grid;grid-template-columns:repeat(3, 1fr);gap:4px;margin-bottom:5px;">
          <button data-smart="smart_mat_mirror" class="smart-mat-btn" style="padding:4px 3px;font-size:10px;font-weight:600;border-radius:5px;border:1px solid #cbd5e1;background:#ffffff;color:#0f172a;cursor:pointer;white-space:nowrap;">🪞 Зеркало</button>
          <button data-smart="smart_mat_light_warm" class="smart-mat-btn" style="padding:4px 3px;font-size:10px;font-weight:600;border-radius:5px;border:1px solid #fcd34d;background:#fffbeb;color:#92400e;cursor:pointer;white-space:nowrap;">💡 Свет Тёпл.</button>
          <button data-smart="smart_mat_light_neutral" class="smart-mat-btn" style="padding:4px 3px;font-size:10px;font-weight:600;border-radius:5px;border:1px solid #bae6fd;background:#f0f9ff;color:#075985;cursor:pointer;white-space:nowrap;">🔆 Свет Нейтр.</button>
          <button data-smart="smart_mat_glass_clear" class="smart-mat-btn" style="padding:4px 3px;font-size:10px;font-weight:600;border-radius:5px;border:1px solid #cbd5e1;background:#ffffff;color:#0f172a;cursor:pointer;white-space:nowrap;">🥂 Стекло Пр.</button>
          <button data-smart="smart_mat_glass_fluted" class="smart-mat-btn" style="padding:4px 3px;font-size:10px;font-weight:600;border-radius:5px;border:1px solid #cbd5e1;background:#ffffff;color:#0f172a;cursor:pointer;white-space:nowrap;">🪟 Рифлёное</button>
          <button data-smart="__clear__" class="smart-mat-btn" title="Сбросить спецматериал с выделенного объекта и выключить кисть" style="padding:4px 3px;font-size:10px;font-weight:700;border-radius:5px;border:1px solid #fca5a5;background:#fef2f2;color:#b91c1c;cursor:pointer;white-space:nowrap;">✖ Сброс мат.</button>
        </div>
        <div style="display:flex;gap:4px;">
          <button id="smart-apply-selected-btn" title="Применить выбранный спецматериал (или сброс) к выделенному в сцене объекту" style="flex:1;padding:5px 5px;font-size:10px;font-weight:700;border-radius:5px;border:1px solid #2563eb;background:#2563eb;color:#ffffff;cursor:pointer;white-space:nowrap;">✨ К выделенному</button>
          <button id="smart-undo-btn" title="Отменить последнее окрашивание спецматериалом (Ctrl+Z)" style="padding:5px 6px;font-size:10px;font-weight:600;border-radius:5px;border:1px solid #cbd5e1;background:#ffffff;color:#334155;cursor:pointer;white-space:nowrap;">↩ Отмена</button>
          <button id="smart-eyedropper-btn" title="Включить кисть на 1 клик по поверхности (автоматически выключается после 1 клика)" style="padding:5px 6px;font-size:10px;font-weight:600;border-radius:5px;border:1px solid #cbd5e1;background:#ffffff;color:#1e293b;cursor:pointer;white-space:nowrap;">💧 Кисть 1 клик</button>
        </div>
      </div>

      <!-- SEARCH + RESIZABLE CATEGORY TAGS -->
      <div style="padding:6px 10px 3px 10px;flex-shrink:0;">
        <input id="skypro-search-inp" type="text" placeholder="Поиск по моделям, категории или #тегу..." style="width:100%;box-sizing:border-box;padding:5px 8px;border:1px solid #cbd5e1;border-radius:6px;font-size:11px;outline:none;" />
        <div id="skypro-tags-row" style="display:flex;flex-wrap:wrap;gap:4px;margin-top:5px;height:58px;min-height:26px;max-height:220px;overflow-y:auto;align-content:flex-start;"></div>
      </div>
      <div id="skypro-tags-resizer" title="Потяните вверх/вниз, чтобы расширить или уменьшить блок категорий" style="height:6px;cursor:ns-resize;background:#f1f5f9;border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;justify-content:center;flex-shrink:0;user-select:none;">
        <span style="width:28px;height:2px;background:#94a3b8;border-radius:2px;display:block;"></span>
      </div>

      <!-- RESPONSIVE MODEL CARDS GRID -->
      <div id="skypro-cards-grid" style="flex:1;overflow-y:auto;padding:8px 10px;display:grid;grid-template-columns:repeat(auto-fill, minmax(112px, 1fr));grid-auto-rows:122px;gap:8px;align-content:start;"></div>

      <!-- SPLITTER FOR INSPECTOR / PARTS LIST -->
      <div id="skypro-parts-resizer" title="Потяните вверх/вниз, чтобы изменить высоту списка частей модели" style="height:6px;cursor:ns-resize;background:#f1f5f9;border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;justify-content:center;flex-shrink:0;user-select:none;">
        <span style="width:28px;height:2px;background:#94a3b8;border-radius:2px;display:block;"></span>
      </div>

      <div id="skypro-inspector" style="padding:6px 10px;background:#f8fafc;flex-shrink:0;">
        <div id="skypro-sel-title" style="font-size:11px;font-weight:700;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:4px;">Выберите модель</div>
        <div style="background:#fff;border:1px solid #e2e8f0;border-radius:6px;padding:4px 7px;margin-bottom:5px;">
          <div style="display:flex;justify-content:space-between;align-items:center;font-size:10px;color:#475569;margin-bottom:2px;">
            <span>Масштаб текстуры: <b id="skypro-uv-scale-val">1.0x</b></span>
            <input id="skypro-uv-scale-rng" type="range" min="0.2" max="5.0" step="0.1" value="1.0" style="width:105px;height:4px;cursor:pointer;" />
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;font-size:10px;color:#475569;">
            <span>Поворот текстуры: <b id="skypro-uv-rot-val">0°</b></span>
            <input id="skypro-uv-rot-rng" type="range" min="0" max="360" step="5" value="0" style="width:105px;height:4px;cursor:pointer;" />
          </div>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;">
          <span style="font-size:10px;color:#64748b;">Части модели (шарики сняты):</span>
          <button id="skypro-keep-one-btn" style="background:none;border:none;color:#2563eb;font-size:10px;font-weight:600;cursor:pointer;padding:0;">Оставить 1 предмет</button>
        </div>
        <div id="skypro-parts-list" style="height:68px;min-height:32px;max-height:260px;overflow-y:auto;background:#fff;border:1px solid #e2e8f0;border-radius:6px;padding:3px 6px;margin-bottom:5px;font-size:10px;"></div>
        <div style="display:flex;flex-direction:column;gap:4px;">
          <button id="skypro-insert-btn" style="width:100%;padding:7px 10px;background:#2563eb;color:#fff;border:none;border-radius:6px;font-size:11.5px;font-weight:600;cursor:pointer;">+ Вставить в комнату (1 сек)</button>
          <button id="skypro-make-native-btn" title="Конвертировать выбранные части с PBR-текстурами в нативную модель Homestyler (seekId) для облачного рендера" style="width:100%;padding:6px 10px;background:#0f172a;color:#f8fafc;border:1px solid #334155;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;">✨ Сделать настоящей моделью Homestyler</button>
        </div>
        <div id="skypro-status-msg" style="margin-top:4px;font-size:10px;color:#16a34a;min-height:14px;line-height:1.25;"></div>
      </div>
    </div>
  `;

  document.body.appendChild(panel);
  document.body.appendChild(toggleBtn);

  const bodyWrap = panel.querySelector('#skypro-body-wrap');
  const minBtn = panel.querySelector('#skypro-min-btn');
  minBtn.onclick = () => {
    isMinimized = !isMinimized;
    if (isMinimized) {
      savedHeightBeforeMin = panel.style.height || 'calc(100vh - 104px)';
      bodyWrap.style.display = 'none';
      panel.style.height = 'auto';
      panel.style.minHeight = '0px';
      minBtn.textContent = '▢';
    } else {
      bodyWrap.style.display = 'flex';
      panel.style.height = savedHeightBeforeMin;
      panel.style.minHeight = '260px';
      minBtn.textContent = '—';
    }
    syncToggleBtnPos();
  };

  // Header dragging + 8-direction outer resizing + 2 internal horizontal splitters
  const dragHeader = panel.querySelector('#skypro-drag-header');
  const tagsRow = panel.querySelector('#skypro-tags-row');
  const tagsResizer = panel.querySelector('#skypro-tags-resizer');
  const partsListEl = panel.querySelector('#skypro-parts-list');
  const partsResizer = panel.querySelector('#skypro-parts-resizer');

  let dragMode = null; // 'move' | 'resize' | 'tags' | 'parts'
  let resizeDir = '';
  let startX = 0, startY = 0, startRight = 258, startTop = 54, startW = 308, startH = 600, startSecH = 58;

  dragHeader.addEventListener('mousedown', (e) => {
    if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') return;
    dragMode = 'move';
    startX = e.clientX;
    startY = e.clientY;
    startRight = parseInt(panel.style.right || '258', 10);
    startTop = parseInt(panel.style.top || '54', 10);
    e.preventDefault();
  });

  panel.querySelectorAll('[data-rdir]').forEach(handle => {
    handle.addEventListener('mousedown', (e) => {
      if (isMinimized) return;
      dragMode = 'resize';
      resizeDir = handle.getAttribute('data-rdir') || '';
      startX = e.clientX;
      startY = e.clientY;
      startRight = parseInt(panel.style.right || '258', 10);
      startTop = parseInt(panel.style.top || '54', 10);
      startW = panel.offsetWidth;
      startH = panel.offsetHeight;
      e.preventDefault();
      e.stopPropagation();
    });
  });

  tagsResizer.addEventListener('mousedown', (e) => {
    dragMode = 'tags';
    startY = e.clientY;
    startSecH = tagsRow.offsetHeight;
    e.preventDefault();
  });

  partsResizer.addEventListener('mousedown', (e) => {
    dragMode = 'parts';
    startY = e.clientY;
    startSecH = partsListEl.offsetHeight;
    e.preventDefault();
  });

  window.addEventListener('mousemove', (e) => {
    if (!dragMode) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (dragMode === 'move') {
      const newRight = Math.max(4, Math.min(window.innerWidth - panel.offsetWidth - 4, startRight - dx));
      const newTop = Math.max(4, Math.min(window.innerHeight - 48, startTop + dy));
      panel.style.right = newRight + 'px';
      panel.style.top = newTop + 'px';
      syncToggleBtnPos();
    } else if (dragMode === 'resize') {
      if (resizeDir.includes('w')) {
        const newW = Math.max(250, Math.min(760, startW - dx));
        panel.style.width = newW + 'px';
      }
      if (resizeDir.includes('e')) {
        const newW = Math.max(250, Math.min(760, startW + dx));
        const actualDw = newW - startW;
        const newRight = Math.max(4, startRight - actualDw);
        panel.style.width = newW + 'px';
        panel.style.right = newRight + 'px';
      }
      if (resizeDir.includes('s')) {
        const newH = Math.max(280, Math.min(window.innerHeight - startTop - 10, startH + dy));
        panel.style.height = newH + 'px';
      }
      if (resizeDir.includes('n')) {
        const newH = Math.max(280, Math.min(startTop + startH - 10, startH - dy));
        const actualDh = newH - startH;
        panel.style.top = (startTop - actualDh) + 'px';
        panel.style.height = newH + 'px';
      }
      syncToggleBtnPos();
    } else if (dragMode === 'tags') {
      const newH = Math.max(24, Math.min(220, startSecH + dy));
      tagsRow.style.height = newH + 'px';
    } else if (dragMode === 'parts') {
      const newH = Math.max(32, Math.min(260, startSecH - dy));
      partsListEl.style.height = newH + 'px';
    }
  });
  window.addEventListener('mouseup', () => { dragMode = null; });

  const gridEl = panel.querySelector('#skypro-cards-grid');
  const searchInp = panel.querySelector('#skypro-search-inp');
  const countBadge = panel.querySelector('#skypro-count-badge');
  const refreshBtn = panel.querySelector('#skypro-refresh-btn');
  const selTitleEl = panel.querySelector('#skypro-sel-title');
  const uvScaleRng = panel.querySelector('#skypro-uv-scale-rng');
  const uvScaleVal = panel.querySelector('#skypro-uv-scale-val');
  const uvRotRng = panel.querySelector('#skypro-uv-rot-rng');
  const uvRotVal = panel.querySelector('#skypro-uv-rot-val');
  const keepOneBtn = panel.querySelector('#skypro-keep-one-btn');
  const insertBtn = panel.querySelector('#skypro-insert-btn');
  const makeNativeBtn = panel.querySelector('#skypro-make-native-btn');
  const statusMsg = panel.querySelector('#skypro-status-msg');
  const smartIndicator = panel.querySelector('#smart-brush-indicator');
  const smartBtns = Array.from(panel.querySelectorAll('.smart-mat-btn'));
  const smartApplySelectedBtn = panel.querySelector('#smart-apply-selected-btn');
  const smartUndoBtn = panel.querySelector('#smart-undo-btn');
  const smartEyedropperBtn = panel.querySelector('#smart-eyedropper-btn');

  // Ensure brush is OFF by default so clicking objects in the scene NEVER paints them accidentally
  window.__activeSmartBrushSpec = undefined;

  // Remember last selected entity: clicking the panel may clear Homestyler selection
  let lastSelectedEnt = null;
  if (window.__smartSelPoll) clearInterval(window.__smartSelPoll);
  window.__smartSelPoll = setInterval(() => {
    try {
      const s = app.selectionManager.selected()[0];
      if (s) lastSelectedEnt = s;
    } catch (e) {}
  }, 150);

  window.__applySmartMaterialToEntity = (ent, specOrNull) => {
    if (!ent) return false;
    if (!specOrNull) {
      return window.__clearAllSmartMaterialsOnEntity(ent);
    }
    const v3d = app.getActive3DView();
    const disp = v3d && v3d.displayList[ent.id];
    if (!disp || !disp.node) return false;
    const mcs = collectNodeMcs(disp.node);
    if (!mcs.length) return false;
    mcs.forEach(mc => {
      try { applySmartSpecToMeshComponent(mc, specOrNull, ent.id); } catch (e) {}
    });
    if (v3d.renderingMgr) v3d.renderingMgr.needUpdate = true;
    if (v3d.context) v3d.context.needsRendering = true;
    return true;
  };

  // Helper to apply a smart material (or reset) directly to the currently selected Homestyler entity
  const applySmartSpecToCurrentSelection = (specOrNull) => {
    const selectedList = app.selectionManager ? app.selectionManager.selected() : [];
    const targetEnt = selectedList[0] || lastSelectedEnt || lastInsertedContent;
    if (!targetEnt) {
      statusMsg.style.color = '#d97706';
      statusMsg.textContent = '⚠ Сначала выделите объект в 3D-сцене (или нажмите «💧 Кисть 1 клик» и кликните по поверхности)';
      return false;
    }
    const ok = window.__applySmartMaterialToEntity(targetEnt, specOrNull);
    if (ok) {
      window.__onSmartMaterialAppliedUI(targetEnt, specOrNull);
      return true;
    }
    statusMsg.style.color = '#dc2626';
    statusMsg.textContent = '⚠ Не удалось найти 3D-меш у выделенного элемента — нажмите «💧 Кисть 1 клик» и кликните по поверхности';
    return false;
  };

  let activeSmartKey = 'smart_mat_mirror';

  const updateSmartButtonsUI = (activeKey) => {
    smartBtns.forEach(btn => {
      const k = btn.getAttribute('data-smart');
      const isAct = k === activeKey;
      btn.style.outline = isAct ? '2px solid #2563eb' : 'none';
      btn.style.transform = isAct ? 'scale(0.98)' : 'none';
    });
    const isBrushOn = window.__activeSmartBrushSpec !== undefined;
    smartEyedropperBtn.style.background = isBrushOn ? '#dbeafe' : '#ffffff';
    smartEyedropperBtn.style.borderColor = isBrushOn ? '#2563eb' : '#cbd5e1';
    if (!isBrushOn) {
      const sp = activeKey && activeKey !== '__clear__' ? SMART_SPECS[activeKey] : null;
      smartIndicator.textContent = sp ? ('Выбрано: ' + sp.shortName + ' (Кисть выкл.)') : (activeKey === '__clear__' ? 'Выбрано: Сброс (Кисть выкл.)' : 'Кисть: Выкл.');
      smartIndicator.style.color = '#64748b';
    } else if (window.__activeSmartBrushSpec === null) {
      smartIndicator.textContent = '💧 Кисть (1 клик): СБРОС';
      smartIndicator.style.color = '#dc2626';
    } else {
      const sp = window.__activeSmartBrushSpec;
      smartIndicator.textContent = '💧 Кисть (1 клик): ' + (sp ? sp.shortName : '');
      smartIndicator.style.color = '#2563eb';
    }
  };

  window.__syncSmartBrushOffUI = (msg) => {
    window.__activeSmartBrushSpec = undefined;
    updateSmartButtonsUI(activeSmartKey);
    if (msg) {
      statusMsg.style.color = '#64748b';
      statusMsg.textContent = msg;
    }
  };

  // Selecting a material button NEVER turns on sticky viewport click-painting!
  // Clicking "✖ Сброс мат." immediately turns off any brush AND resets the currently selected object!
  smartBtns.forEach(btn => {
    btn.onclick = () => {
      const key = btn.getAttribute('data-smart');
      activeSmartKey = key;
      // Always keep automatic viewport click-painting OFF unless "💧 Кисть 1 клик" is explicitly pressed
      window.__activeSmartBrushSpec = undefined;
      try {
        const curCmd = app.cmdManager && app.cmdManager.current;
        if (curCmd && curCmd.type && String(curCmd.type).toLowerCase().includes('materialbrush')) {
          app.cmdManager.cancel();
        }
      } catch (e) {}
      updateSmartButtonsUI(key);

      if (key === '__clear__') {
        const selectedList = app.selectionManager ? app.selectionManager.selected() : [];
        const targetEnt = selectedList[0] || lastSelectedEnt;
        if (targetEnt) {
          window.__clearAllSmartMaterialsOnEntity(targetEnt);
          statusMsg.style.color = '#16a34a';
          statusMsg.textContent = `✓ Сброшен спецматериал с выделенного объекта (#${targetEnt.displayName || targetEnt.name || targetEnt.id}). Чтобы сбросить точечно кликом — нажмите «💧 Кисть 1 клик».`;
        } else {
          statusMsg.style.color = '#16a34a';
          statusMsg.textContent = '✓ Кисть выключена. Выделите объект и нажмите «✖ Сброс мат.», либо нажмите «↩ Отмена».';
        }
        return;
      }

      const sp = SMART_SPECS[key];
      statusMsg.style.color = '#2563eb';
      statusMsg.textContent = `Выбран ${sp ? sp.shortName : key}: нажмите «✨ К выделенному» (или «💧 Кисть 1 клик» для точечного клика)`;
    };
  });

  smartApplySelectedBtn.onclick = () => {
    window.__activeSmartBrushSpec = undefined;
    const key = activeSmartKey || 'smart_mat_mirror';
    activeSmartKey = key;
    updateSmartButtonsUI(key);
    const specOrNull = key === '__clear__' ? null : SMART_SPECS[key];
    applySmartSpecToCurrentSelection(specOrNull);
  };

  smartUndoBtn.onclick = () => {
    window.__activeSmartBrushSpec = undefined;
    updateSmartButtonsUI(activeSmartKey);
    const undone = window.__undoLastSmartMaterial();
    if (undone) {
      statusMsg.style.color = '#16a34a';
      statusMsg.textContent = `↩ Отменено окрашивание элемента (#${undone.entityId || 'объект'}) — возвращено исходное состояние`;
    } else {
      statusMsg.style.color = '#64748b';
      statusMsg.textContent = 'Нет записей в истории спецматериалов для отмены (выделите объект и нажмите «✖ Сброс мат.»)';
    }
  };

  // Hook Escape key & Ctrl+Z to turn off brush or undo last smart material
  if (!window.__smartKeyHookedV18) {
    window.__smartKeyHookedV18 = true;
    window.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape' && window.__activeSmartBrushSpec !== undefined) {
        window.__activeSmartBrushSpec = undefined;
        if (window.__syncSmartBrushOffUI) window.__syncSmartBrushOffUI('Кисть спецматериалов выключена (Esc)');
      } else if ((ev.ctrlKey || ev.metaKey) && !ev.shiftKey && (ev.key === 'z' || ev.key === 'Z' || ev.key === 'я' || ev.key === 'Я')) {
        if (window.__smartHistoryStack && window.__smartHistoryStack.length > 0) {
          const top = window.__smartHistoryStack[window.__smartHistoryStack.length - 1];
          if (top && (Date.now() - (top.ts || 0) < 120000)) {
            window.__undoLastSmartMaterial();
          }
        }
      }
    }, true);
  }

  smartEyedropperBtn.onclick = () => {
    if (window.__activeSmartBrushSpec !== undefined) {
      window.__activeSmartBrushSpec = undefined;
      updateSmartButtonsUI(activeSmartKey);
      statusMsg.style.color = '#64748b';
      statusMsg.textContent = 'Кисть выключена (обычный режим выбора объектов)';
      return;
    }
    const key = activeSmartKey || 'smart_mat_mirror';
    activeSmartKey = key;
    const specOrNull = key === '__clear__' ? null : SMART_SPECS[key];
    window.__activeSmartBrushSpec = specOrNull;
    updateSmartButtonsUI(key);
    statusMsg.style.color = specOrNull ? '#2563eb' : '#dc2626';
    statusMsg.textContent = specOrNull
      ? `💧 Кисть на 1 клик (${specOrNull.shortName}): кликните 1 раз по нужной грани/нише в 3D (после клика кисть сама выключится)`
      : '💧 Сброс на 1 клик: кликните 1 раз по светящейся/зеркальной грани в 3D, чтобы вернуть ей обычный материал';
  };

  window.__onSmartMaterialAppliedUI = (ent, specOrNull) => {
    updateSmartButtonsUI(activeSmartKey);
    const nm = (ent && (ent.displayName || ent.name || ent.id)) || 'объект';
    statusMsg.style.color = '#16a34a';
    statusMsg.textContent = specOrNull
      ? `✓ Нанесён ${specOrNull.shortName} на #${nm} (кисть автоматически выключена)`
      : `✓ Сброшен спецматериал на #${nm} (возвращено исходное состояние)`;
  };

  const updateSelectedModelUvTransform = () => {
    const scaleMul = parseFloat(uvScaleRng.value) || 1.0;
    const rotDeg = parseFloat(uvRotRng.value) || 0;
    uvScaleVal.textContent = scaleMul.toFixed(1) + 'x';
    uvRotVal.textContent = Math.round(rotDeg) + '°';

    const sel = app.selectionManager.selected()[0] || lastInsertedContent;
    if (!sel) return;
    const v3d = app.getActive3DView();
    const disp = v3d && v3d.displayList[sel.id];
    if (!disp || !disp._modelNode) return;
    const mcs = collectNodeMcs(disp._modelNode);
    mcs.forEach(mc => {
      const m = mc.getMaterial();
      if (m && m._isSkyProMaterial) {
        if (!lastPaintedMeshComponent || mc === lastPaintedMeshComponent || mcs.length === 1) {
          applyUvTransformToPhong(m, scaleMul, rotDeg);
        }
      }
    });
    if (disp.dirtyGraph) disp.dirtyGraph();
    if (v3d.context) v3d.context.needsRendering = true;
  };

  uvScaleRng.oninput = updateSelectedModelUvTransform;
  uvRotRng.oninput = updateSelectedModelUvTransform;

  let activeTag = 'Все';
  let selectedItem = models.find(m => m.isPriority && m.isConverted !== false) || models.find(m => m.id === '8863599.6a2924a060ba4') || models[0];
  let checkedParts = new Set();
  const PRESET_TAGS = [
    'Все', '#⭐Приоритет', '#ДекоративныйНабор', '#Ogogo', '#divan.ru', '#skdesign', '#Maytoni',
    '#Мебель', '#Диваны', '#Кресла', '#Столы', '#Стулья', '#Кровати',
    '#Кухня', '#Кухонная техника', '#Шкафы', '#Освещение', '#Люстры', '#Бра',
    '#Торшеры', '#Декор', '#Санузел', '#Детская', '#Растения', '#Зеркала', '#Ковры'
  ];
  let allTags = [...PRESET_TAGS];

  const rebuildTagsList = () => {
    const tagSet = new Set(PRESET_TAGS);
    models.forEach(m => {
      const cat = m.category || (m.categories && m.categories[0]);
      if (cat) {
        const hc = cat.startsWith('#') ? cat : ('#' + cat);
        if (tagSet.size < 36) tagSet.add(hc);
      }
      (m.tags || []).slice(0, 3).forEach(t => {
        const ht = t.startsWith('#') ? t : ('#' + t);
        if (tagSet.size < 36) tagSet.add(ht);
      });
    });
    allTags = Array.from(tagSet);
  };
  rebuildTagsList();

  const CATEGORY_SYNONYMS = {
    '⭐приоритет': ['⭐приоритет', 'декоративныйнабор', 'ogogo', 'divan.ru', 'skdesign', 'maytoni'],
    'декоративныйнабор': ['декоративныйнабор', 'наборыдекора', 'decorative set', 'декоративный набор'],
    'ogogo': ['ogogo', 'огого'],
    'divan.ru': ['divan.ru', 'диванру', 'divanru', 'диван.ру'],
    'skdesign': ['skdesign', 'sk design'],
    'maytoni': ['maytoni'],
    'диваны': ['диван', 'sofa', 'couch'],
    'кресла': ['кресл', 'armchair', 'chair', 'пуф', 'pouf'],
    'столы': ['стол', 'table', 'desk', 'консоль', 'console'],
    'стулья': ['стул', 'барный', 'stool', 'chair'],
    'кровати': ['кроват', 'bed', 'headboard'],
    'кухня': ['кухн', 'kitchen', 'мойка', 'вытяжк'],
    'кухонная техника': ['техник', 'холодильник', 'fridge', 'духов', 'плита', 'кофе', 'bosch', 'smeg', 'appliance'],
    'шкафы': ['шкаф', 'комод', 'тумб', 'стеллаж', 'wardrobe', 'cabinet', 'dresser', 'sideboard'],
    'освещение': ['освещен', 'свет', 'люстр', 'бра', 'ламп', 'торшер', 'светильник', 'lamp', 'sconce', 'chandelier', 'pendant', 'light'],
    'люстры': ['люстр', 'подвес', 'chandelier', 'pendant', 'hanging'],
    'бра': ['бра', 'sconce', 'wall lamp', 'настенн'],
    'торшеры': ['торшер', 'floor lamp', 'напольн'],
    'декор': ['декор', 'decor', 'ваз', 'vase', 'картин', 'подушк', 'pillow', 'свеч', 'candle', 'набор', 'set', 'часы', 'статуэт', 'посуд'],
    'санузел': ['санузел', 'ванн', 'раковин', 'унитаз', 'душ', 'смесител', 'bath', 'sink', 'faucet', 'toilet', 'полотенц'],
    'детская': ['детск', 'игрушк', 'kids', 'nursery', 'toy'],
    'растения': ['растен', 'цвет', 'дерев', 'plant', 'flower', 'tree', 'букет'],
    'зеркала': ['зеркал', 'mirror'],
    'ковры': ['ковер', 'ковёр', 'rug', 'carpet']
  };

  const renderTags = () => {
    tagsRow.innerHTML = '';
    allTags.forEach(tag => {
      const b = document.createElement('button');
      const active = tag === activeTag;
      b.textContent = tag;
      b.style.cssText = `border:1px solid ${active ? '#93c5fd' : '#e2e8f0'};background:${active ? '#eff6ff' : '#f8fafc'};color:${active ? '#2563eb' : '#475569'};border-radius:6px;padding:2px 6px;font-size:10px;cursor:pointer;font-weight:${active ? '600' : '500'};`;
      b.onclick = () => {
        activeTag = tag;
        renderTags();
        renderGrid();
      };
      tagsRow.appendChild(b);
    });
  };

  const updateCountBadgeText = () => {
    const prioReady = models.filter(m => m.isPriority && m.isConverted !== false).length;
    const prioTotal = models.filter(m => m.isPriority).length;
    countBadge.textContent = prioTotal > 0 ? `⭐ ${prioReady}/${prioTotal} (${models.length} шт.)` : `${models.length} шт.`;
  };
  updateCountBadgeText();

  const refreshCatalogFromServer = async (forceRender) => {
    try {
      const r = await fetch(SERVER_ORIGIN + '/api/models?t=' + Date.now());
      const fresh = await r.json();
      if (Array.isArray(fresh)) {
        const oldConvCount = models.filter(m => m.isConverted !== false).length;
        const newConvCount = fresh.filter(m => m.isConverted !== false).length;
        if (forceRender || fresh.length !== models.length || newConvCount !== oldConvCount) {
          models = fresh;
          updateCountBadgeText();
          if (selectedItem) {
            const updatedSel = models.find(m => m.id === selectedItem.id);
            if (updatedSel) {
              const wasEmptyParts = !selectedItem.parts || selectedItem.parts.length === 0;
              selectedItem = updatedSel;
              if (wasEmptyParts && updatedSel.parts && updatedSel.parts.length > 0) {
                checkedParts = new Set(updatedSel.parts.filter(p => !(p.isMaterialBallCandidate || p.isBall)).map(p => p.name));
                renderParts();
              }
            }
          }
          rebuildTagsList();
          renderTags();
          renderGrid();
        }
      }
    } catch (e) {}
  };

  refreshBtn.onclick = () => refreshCatalogFromServer(true);
  const batchBtn = panel.querySelector('#skypro-batch-btn');
  let isBatchActive = false;
  const syncBatchBtnState = async () => {
    try {
      const r = await fetch(SERVER_ORIGIN + '/api/batch/status?t=' + Date.now());
      if (!r.ok) return;
      const st = await r.json();
      isBatchActive = !!st.running;
      if (batchBtn) {
        if (isBatchActive) {
          batchBtn.textContent = '■ Стоп GLB';
          batchBtn.style.background = '#fee2e2';
          batchBtn.style.color = '#b91c1c';
          batchBtn.style.borderColor = '#fca5a5';
        } else {
          batchBtn.textContent = '⚙ Пакет GLB';
          batchBtn.style.background = '#f1f5f9';
          batchBtn.style.color = '#334155';
          batchBtn.style.borderColor = '#cbd5e1';
        }
      }
    } catch (e) {}
  };
  if (batchBtn) {
    batchBtn.onclick = async () => {
      try {
        const ep = isBatchActive ? '/api/batch/stop' : '/api/batch/start';
        await fetch(SERVER_ORIGIN + ep, { method: 'POST' });
        await syncBatchBtnState();
        statusMsg.style.color = isBatchActive ? '#16a34a' : '#64748b';
        statusMsg.textContent = isBatchActive ? '⚙ Запущена пакетная конвертация новых моделей в GLB' : '■ Пакетная конвертация GLB остановлена (0% нагрузки)';
      } catch (e) {}
    };
    syncBatchBtnState();
  }
  if (window.__skyproAutoRefreshTimer) {
    clearInterval(window.__skyproAutoRefreshTimer);
    window.__skyproAutoRefreshTimer = null;
  }

  const triggerLiveUpdateIfInserted = async () => {
    if (!selectedItem) return;
    const upd = await window.__updateSkyProLiveParts(selectedItem, Array.from(checkedParts));
    if (upd) {
      statusMsg.style.color = '#16a34a';
      statusMsg.textContent = `✓ Обновлено: ${upd.keptCount} ч. (${upd.cmSize})`;
    }
  };

  const selectModel = (item, keepAllChecked) => {
    selectedItem = item;
    if (keepAllChecked) {
      checkedParts = new Set((item.parts || []).map(p => p.name));
    } else {
      checkedParts = new Set((item.parts || []).filter(p => !(p.isMaterialBallCandidate || p.isBall)).map(p => p.name));
    }
    selTitleEl.textContent = item.title || item.label || item.id;
    renderParts();
    const cards = gridEl.querySelectorAll('[data-model-id]');
    if (cards.length > 0) {
      cards.forEach(c => {
        const cid = c.getAttribute('data-model-id');
        const isPrio = c.getAttribute('data-prio') === '1';
        c.style.border = (cid === String(item.id)) ? '2px solid #2563eb' : (isPrio ? '1.5px solid #93c5fd' : '1px solid #e2e8f0');
      });
    } else {
      renderGrid();
    }
  };

  const renderParts = () => {
    partsListEl.innerHTML = '';
    if (!selectedItem || !selectedItem.parts) return;
    selectedItem.parts.forEach((p, idx) => {
      const isBall = !!(p.isMaterialBallCandidate || p.isBall);
      const row = document.createElement('label');
      row.style.cssText = 'display:flex;align-items:center;gap:5px;padding:2px 0;cursor:pointer;color:' + (isBall ? '#94a3b8' : '#1e293b');
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = checkedParts.has(p.name);
      cb.onchange = async () => {
        if (cb.checked) checkedParts.add(p.name);
        else checkedParts.delete(p.name);
        await triggerLiveUpdateIfInserted();
      };
      const span = document.createElement('span');
      span.textContent = `${idx + 1}. ${p.name}${isBall ? ' (шарик)' : ''}`;
      row.appendChild(cb);
      row.appendChild(span);
      partsListEl.appendChild(row);
    });
  };

  keepOneBtn.onclick = async () => {
    if (!selectedItem) return;
    const oneNames = await getOneItemPartNames(selectedItem);
    checkedParts = new Set(oneNames);
    renderParts();
    await triggerLiveUpdateIfInserted();
  };

  const renderGrid = () => {
    const q = (searchInp.value || '').trim().toLowerCase();
    const tagKey = activeTag.toLowerCase().replace('#', '');
    const tagSyns = CATEGORY_SYNONYMS[tagKey] || [tagKey];
    gridEl.innerHTML = '';
    const frag = document.createDocumentFragment();
    models.forEach(item => {
      const titleStr = item.title || item.label || item.id;
      const hay = (titleStr + ' ' + (item.brand || '') + ' ' + (item.category || '') + ' ' + (item.subcategory || '') + ' ' + (item.categories || []).join(' ') + ' ' + (item.tags || []).join(' ')).toLowerCase();
      if (q && !hay.includes(q.replace('#', ''))) return;
      if (activeTag !== 'Все' && !tagSyns.some(syn => hay.includes(syn))) return;

      const isSel = selectedItem && selectedItem.id === item.id;
      const card = document.createElement('div');
      card.setAttribute('data-model-id', String(item.id));
      card.setAttribute('data-prio', item.isPriority ? '1' : '0');
      card.style.cssText = [
        'width:100%',
        'height:100%',
        'box-sizing:border-box',
        'border-radius:8px',
        'border:' + (isSel ? '2px solid #2563eb' : (item.isPriority ? '1.5px solid #93c5fd' : '1px solid #e2e8f0')),
        'overflow:hidden',
        'position:relative',
        'cursor:pointer',
        'background:#f8fafc',
        'display:flex',
        'align-items:center',
        'justify-content:center'
      ].join(';');

      const img = document.createElement('img');
      img.loading = 'lazy';
      img.decoding = 'async';
      img.src = item.thumbDataUri || (SERVER_ORIGIN + (item.reference || item.preview));
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
      card.appendChild(img);

      if (item.isPriority) {
        const topBadge = document.createElement('div');
        const isReady = item.isConverted !== false;
        topBadge.textContent = isReady ? ('★ ' + (item.brand || 'Топ')) : ('⏳ ' + (item.brand || 'В очереди'));
        topBadge.style.cssText = `position:absolute;top:4px;left:4px;background:${isReady ? 'rgba(22,163,74,0.88)' : 'rgba(37,99,235,0.86)'};color:#fff;font-size:8.5px;font-weight:700;padding:1.5px 5px;border-radius:4px;pointer-events:none;`;
        card.appendChild(topBadge);
      }

      const badge = document.createElement('div');
      badge.textContent = titleStr;
      badge.style.cssText = 'position:absolute;left:0;right:0;bottom:0;background:linear-gradient(transparent,rgba(15,23,42,0.82));color:#fff;font-size:9.5px;padding:12px 4px 3px 4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
      card.appendChild(badge);

      card.onclick = () => selectModel(item, false);
      frag.appendChild(card);
    });
    gridEl.appendChild(frag);
  };

  searchInp.oninput = renderGrid;

  insertBtn.onclick = async () => {
    if (!selectedItem) return;
    insertBtn.disabled = true;
    insertBtn.textContent = 'Загрузка 3D и текстур...';
    statusMsg.style.color = '#2563eb';
    statusMsg.textContent = 'Загружаем GLB и карты материалов...';
    try {
      const res = await window.__insertSkyProModel(selectedItem, Array.from(checkedParts), null);
      statusMsg.style.color = '#16a34a';
      statusMsg.textContent = '✓ Вставлено в комнату (' + res.cmSize + ')';
    } catch (e) {
      statusMsg.style.color = '#dc2626';
      statusMsg.textContent = 'Ошибка: ' + String(e);
    } finally {
      insertBtn.disabled = false;
      insertBtn.textContent = '+ Вставить в комнату (1 сек)';
    }
  };

  makeNativeBtn.onclick = async () => {
    const sel = app.selectionManager.selected()[0] || lastInsertedContent;
    const itemToConvert = (sel && sel._skyProItem) || selectedItem;
    const partsToConvert = (sel && sel._skyProItem && sel._skyProItem.id === itemToConvert.id && sel._skyProCheckedParts && sel._skyProCheckedParts.length)
      ? sel._skyProCheckedParts
      : Array.from(checkedParts);

    if (!itemToConvert) return;
    makeNativeBtn.disabled = true;
    makeNativeBtn.style.opacity = '0.7';
    statusMsg.style.color = '#2563eb';
    try {
      let targetEnt = (sel && sel._skyProId === itemToConvert.id) ? sel : null;
      if (!targetEnt) {
        statusMsg.textContent = 'Сначала размещаем модель в сцене...';
        const ins = await window.__insertSkyProModel(itemToConvert, partsToConvert, null);
        targetEnt = ins.content;
      }
      await window.__convertSkyProToNativeHomestylerModel(itemToConvert, partsToConvert, targetEnt, (msg) => {
        statusMsg.style.color = msg.startsWith('⚠') ? '#dc2626' : (msg.startsWith('✓') ? '#16a34a' : '#2563eb');
        statusMsg.textContent = msg;
      });
    } catch (e) {
      statusMsg.style.color = '#dc2626';
      statusMsg.textContent = 'Ошибка: ' + String(e.message || e);
    } finally {
      makeNativeBtn.disabled = false;
      makeNativeBtn.style.opacity = '1';
    }
  };

  renderTags();
  if (selectedItem) {
    selectModel(selectedItem, false);
  }

  // Refresh any existing SkyPro models in the current scene with the upgraded UV flipY & materials
  const existingSkyProContents = [];
  app.floorplan.forEachContent(c => {
    if (c && (c._skyProId || skyProRegistry.has(c.displayName))) {
      existingSkyProContents.push(c);
    }
  });
  for (const c of existingSkyProContents) {
    const matchedItem = models.find(m => m.id === c._skyProId || m.title === c.displayName) || c._skyProItem;
    if (matchedItem) {
      try {
        delete modelCache[matchedItem.id];
        await attachSkyProDisplay(c, matchedItem, c._skyProCheckedParts || [], c._skyProPaintedMaterials || {}, true);
      } catch (e) {}
    }
  }

  return { ok: true, modelsCount: models.length, refreshedInScene: existingSkyProContents.length };
})();

