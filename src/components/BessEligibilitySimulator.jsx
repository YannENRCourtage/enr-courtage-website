import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MapPin,
  Search,
  CheckCircle2,
  AlertTriangle,
  Navigation,
  Zap,
  Coins,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Camera,
  Send,
  Loader2,
  Check,
  Info,
  Sparkles,
  RotateCcw,
  Share2,
  Phone,
  Mail,
  User,
  Building2,
  Layers,
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mrblwazb';

// Calcul exact de la distance en mètres entre 2 points GPS (formule de Haversine)
function calculateDistanceMeters(pointA, pointB) {
  if (!pointA || !pointB) return null;
  const R = 6371000; // Rayon de la Terre en mètres
  const dLat = ((pointB.lat - pointA.lat) * Math.PI) / 180;
  const dLng = ((pointB.lng - pointA.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((pointA.lat * Math.PI) / 180) *
      Math.cos((pointB.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Décaler légèrement un point GPS de X mètres (pour initialiser B à ~15m de A)
function offsetCoordsMeters(center, dNorthMeters, dEastMeters) {
  const dLat = dNorthMeters / 111320;
  const dLng = dEastMeters / (111320 * Math.cos((center.lat * Math.PI) / 180));
  return {
    lat: center.lat + dLat,
    lng: center.lng + dLng,
  };
}

// Icônes personnalisées pour le Transformateur (A), le Terrain (B) et les postes Enedis
const createMarkerAIcon = () =>
  new L.DivIcon({
    className: 'bess-marker-a',
    html: `
      <div style="position:relative;display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-100%);cursor:grab;">
        <div style="background:#f97316;color:#fff;font-weight:800;font-size:11px;padding:3px 8px;border-radius:9999px;white-space:nowrap;box-shadow:0 4px 12px rgba(0,0,0,0.45);border:2px solid #fff;margin-bottom:3px;display:flex;align-items:center;gap:4px;">
          <span>⚡ A : Transformateur</span>
        </div>
        <div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#f97316,#ea580c);border:3px solid #fff;box-shadow:0 4px 14px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:15px;">
          A
        </div>
        <div style="width:4px;height:8px;background:#ea580c;border-radius:2px;"></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });

const createMarkerBIcon = () =>
  new L.DivIcon({
    className: 'bess-marker-b',
    html: `
      <div style="position:relative;display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-100%);cursor:grab;">
        <div style="background:#10b981;color:#fff;font-weight:800;font-size:11px;padding:3px 8px;border-radius:9999px;white-space:nowrap;box-shadow:0 4px 12px rgba(0,0,0,0.45);border:2px solid #fff;margin-bottom:3px;display:flex;align-items:center;gap:4px;">
          <span>🔋 B : Mon terrain</span>
        </div>
        <div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#10b981,#059669);border:3px solid #fff;box-shadow:0 4px 14px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:15px;">
          B
        </div>
        <div style="width:4px;height:8px;background:#059669;border-radius:2px;"></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });

const createEnedisPosteIcon = () =>
  new L.DivIcon({
    className: 'enedis-poste-marker',
    html: `
      <div style="position:relative;display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-50%);cursor:pointer;" title="Poste électrique Enedis détecté — Cliquez pour sélectionner">
        <div style="width:26px;height:26px;border-radius:50%;background:#2563eb;border:2px solid #fff;box-shadow:0 2px 10px rgba(37,99,235,0.7);display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;">
          ⚡
        </div>
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });

// Composant dédié pour la Carte Satellite Leaflet (garantit le montage DOM immédiat)
function BessInteractiveMap({
  mapCenter,
  markerA,
  markerB,
  setMarkerA,
  setMarkerB,
  activeClickTarget,
  setActiveClickTarget,
  enedisPostes,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const overlayGroupRef = useRef(null);
  const satLayerRef = useRef(null);
  const osmLayerRef = useRef(null);
  const [mapMode, setMapMode] = useState('satellite'); // 'satellite' | 'plan'

  const activeClickTargetRef = useRef(activeClickTarget);
  activeClickTargetRef.current = activeClickTarget;

  // Initialisation de la carte au montage du composant
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const map = L.map(container, {
      center: [mapCenter.lat, mapCenter.lng],
      zoom: 19,
      maxZoom: 21,
      zoomControl: true,
    });

    // Couche Plan OpenStreetMap en fond de secours immédiat
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxNativeZoom: 19,
      maxZoom: 21,
      attribution: '&copy; OpenStreetMap',
    });

    // Couche Satellite Haute Résolution Google / Esri World Imagery
    const satLayer = L.tileLayer(
      'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
      {
        maxNativeZoom: 20,
        maxZoom: 21,
        attribution: '&copy; Google Satellite / IGN',
      }
    );

    // Fallback automatique sur Esri World Imagery si une tuile Google échoue
    satLayer.on('tileerror', () => {
      if (map.hasLayer(satLayer) && ! satLayer._esriFallbackApplied) {
        satLayer._esriFallbackApplied = true;
        L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          {
            maxNativeZoom: 19,
            maxZoom: 21,
          }
        ).addTo(map);
      }
    });

    satLayer.addTo(map);
    satLayerRef.current = satLayer;
    osmLayerRef.current = osmLayer;

    overlayGroupRef.current = L.layerGroup().addTo(map);

    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      if (activeClickTargetRef.current === 'A') {
        setMarkerA({ lat, lng });
        setActiveClickTarget('B');
      } else {
        setMarkerB({ lat, lng });
      }
    });

    mapRef.current = map;

    // Forcer le recalcul des dimensions pour éviter toute carte grise ou blanche
    const t1 = setTimeout(() => map.invalidateSize(), 50);
    const t2 = setTimeout(() => map.invalidateSize(), 250);
    const t3 = setTimeout(() => map.invalidateSize(), 600);

    let resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserver.observe(container);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      if (resizeObserver) resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recentrage si mapCenter change
  useEffect(() => {
    if (mapRef.current && mapCenter) {
      mapRef.current.setView([mapCenter.lat, mapCenter.lng], 19);
      setTimeout(() => mapRef.current?.invalidateSize(), 100);
    }
  }, [mapCenter]);

  // Bascule Satellite / Plan
  const toggleMapMode = () => {
    const map = mapRef.current;
    if (!map) return;
    if (mapMode === 'satellite') {
      if (satLayerRef.current) map.removeLayer(satLayerRef.current);
      if (osmLayerRef.current) osmLayerRef.current.addTo(map);
      setMapMode('plan');
    } else {
      if (osmLayerRef.current) map.removeLayer(osmLayerRef.current);
      if (satLayerRef.current) satLayerRef.current.addTo(map);
      setMapMode('satellite');
    }
  };

  // Rendu des marqueurs A, B, cercle et ligne de distance
  useEffect(() => {
    const map = mapRef.current;
    const group = overlayGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    // 1. Afficher les postes Enedis détectés
    enedisPostes.forEach((poste) => {
      L.circle([poste.lat, poste.lng], {
        radius: 30,
        color: '#3b82f6',
        weight: 1.5,
        dashArray: '4, 4',
        fillColor: '#3b82f6',
        fillOpacity: 0.08,
      }).addTo(group);

      const pMarker = L.marker([poste.lat, poste.lng], {
        icon: createEnedisPosteIcon(),
      }).addTo(group);

      pMarker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        setMarkerA({ lat: poste.lat, lng: poste.lng });
        setActiveClickTarget('B');
      });
    });

    // 2. Zone autour du Transformateur A
    if (markerA) {
      const dist = calculateDistanceMeters(markerA, markerB);
      const circleColor =
        dist === null || dist <= 30 ? '#10b981' : dist <= 50 ? '#f59e0b' : '#ef4444';

      L.circle([markerA.lat, markerA.lng], {
        radius: 30,
        color: circleColor,
        weight: 2.5,
        fillColor: circleColor,
        fillOpacity: 0.18,
      }).addTo(group);
    }

    // 3. Ligne entre A et B avec étiquette de distance en direct
    if (markerA && markerB) {
      const dist = calculateDistanceMeters(markerA, markerB);
      const lineColor = dist <= 30 ? '#10b981' : dist <= 50 ? '#f59e0b' : '#ef4444';

      const line = L.polyline(
        [
          [markerA.lat, markerA.lng],
          [markerB.lat, markerB.lng],
        ],
        {
          color: lineColor,
          weight: 4,
          dashArray: dist <= 30 ? null : '6, 6',
        }
      ).addTo(group);

      line
        .bindTooltip(
          `<div style="font-weight:900;font-size:12px;color:#0f172a;padding:2px 6px;">📏 Distance : ${dist} m</div>`,
          {
            permanent: true,
            direction: 'center',
            className: 'bess-distance-tooltip',
          }
        )
        .openTooltip();
    }

    // 4. Marqueur A (Transformateur)
    if (markerA) {
      const mA = L.marker([markerA.lat, markerA.lng], {
        icon: createMarkerAIcon(),
        draggable: true,
        zIndexOffset: 1000,
      }).addTo(group);

      mA.on('drag', (e) => {
        const pos = e.target.getLatLng();
        setMarkerA({ lat: pos.lat, lng: pos.lng });
      });
    }

    // 5. Marqueur B (Emplacement terrain)
    if (markerB) {
      const mB = L.marker([markerB.lat, markerB.lng], {
        icon: createMarkerBIcon(),
        draggable: true,
        zIndexOffset: 950,
      }).addTo(group);

      mB.on('drag', (e) => {
        const pos = e.target.getLatLng();
        setMarkerB({ lat: pos.lat, lng: pos.lng });
      });
    }
  }, [markerA, markerB, enedisPostes, setMarkerA, setMarkerB, setActiveClickTarget]);

  return (
    <div className="relative w-full h-[400px] sm:h-[480px] bg-slate-200">
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%', minHeight: '400px' }}
        className="w-full h-full z-0"
      />
      <button
        type="button"
        onClick={toggleMapMode}
        className="absolute top-3 right-3 z-[400] px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-bold shadow-lg border border-white/20 flex items-center gap-1.5 cursor-pointer"
      >
        <Layers className="w-4 h-4 text-emerald-400" />
        <span>{mapMode === 'satellite' ? 'Vue Plan' : 'Vue Satellite'}</span>
      </button>
    </div>
  );
}

export default function BessEligibilitySimulator({ isDirectMode = false }) {
  // Wizard step: 1 = Adresse, 2 = Carte, 3 = Résultat, 4 = Contact Lead
  const [step, setStep] = useState(1);

  // Étape 1 : Recherche d'adresse
  const [addressQuery, setAddressQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [addressError, setAddressError] = useState('');

  // Étape 2 : Coordonnées Carte, Postes Enedis & Marqueurs A / B
  const [mapCenter, setMapCenter] = useState({ lat: 44.8378, lng: -0.5792 });
  const [markerA, setMarkerA] = useState(null); // Transformateur
  const [markerB, setMarkerB] = useState(null); // Terrain
  const [activeClickTarget, setActiveClickTarget] = useState('A'); // 'A' | 'B'
  const [enedisPostes, setEnedisPostes] = useState([]);
  const [isLoadingEnedis, setIsLoadingEnedis] = useState(false);
  const [enedisNotice, setEnedisNotice] = useState('');

  // Étape 4 : Formulaire de capture de lead
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [ownerProfile, setOwnerProfile] = useState('Propriété agricole');
  const [comments, setComments] = useState('');
  const [transformerPhoto, setTransformerPhoto] = useState(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState('');
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [shareCopied, setShareCopied] = useState(false);

  // Distance en temps réel entre A et B
  const distanceMeters = calculateDistanceMeters(markerA, markerB);

  // Statut d'éligibilité
  const eligibilityStatus = (() => {
    if (distanceMeters === null) return 'pending';
    if (distanceMeters <= 30) return 'eligible';
    if (distanceMeters <= 50) return 'borderline';
    return 'too_far';
  })();

  // Autocomplétion API Adresse data.gouv.fr
  useEffect(() => {
    const q = addressQuery.trim();
    if (q.length < 3 || q === selectedAddress) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingAddress(true);
      try {
        const res = await fetch(
          `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(q)}&limit=6`
        );
        const data = await res.json();
        if (data && Array.isArray(data.features)) {
          setSuggestions(data.features);
        }
      } catch (err) {
        console.warn('Erreur API adresse:', err);
      } finally {
        setIsSearchingAddress(false);
      }
    }, 260);

    return () => clearTimeout(timer);
  }, [addressQuery, selectedAddress]);

  // Interrogation automatique de l'API Open Data Enedis autour de la parcelle (rayon 150m)
  const fetchNearbyEnedisTransformers = useCallback(async (lat, lng) => {
    setIsLoadingEnedis(true);
    setEnedisNotice('');
    try {
      const whereClause = `within_distance(geo_point_2d, GEOM'POINT(${lng} ${lat})', 150m)`;
      const url = `https://data.enedis.fr/api/explore/v2.1/catalog/datasets/poste-electrique/records?where=${encodeURIComponent(
        whereClause
      )}&limit=20`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('API Enedis indisponible');
      const data = await res.json();
      const results = Array.isArray(data?.results) ? data.results : [];

      const parsedPostes = results
        .map((rec, idx) => {
          const pt = rec.geo_point_2d || rec.geometry?.coordinates;
          const pLat = pt?.lat ?? (Array.isArray(pt) ? pt[1] : null);
          const pLng = pt?.lon ?? (Array.isArray(pt) ? pt[0] : null);
          if (typeof pLat !== 'number' || typeof pLng !== 'number') return null;
          return {
            id: rec.id || `enedis-${idx}`,
            lat: pLat,
            lng: pLng,
            name: rec.nom_poste || rec.libelle || `Poste électrique Enedis #${idx + 1}`,
          };
        })
        .filter(Boolean);

      setEnedisPostes(parsedPostes);

      if (parsedPostes.length > 0) {
        const closest = parsedPostes[0];
        setMarkerA({ lat: closest.lat, lng: closest.lng });
        setMarkerB({ lat, lng });
        setActiveClickTarget('B');
        setEnedisNotice(
          `${parsedPostes.length} transformateur(s) électrique(s) détecté(s) à proximité ! Le marqueur A a été pré-positionné sur le poste le plus proche.`
        );
      } else {
        const initA = offsetCoordsMeters({ lat, lng }, 6, -8);
        const initB = offsetCoordsMeters({ lat, lng }, -4, 6);
        setMarkerA(initA);
        setMarkerB(initB);
        setActiveClickTarget('A');
        setEnedisNotice(
          'Placez le marqueur A sur le transformateur électrique visible sur la carte satellite, puis le marqueur B sur votre terrain.'
        );
      }
    } catch {
      const initA = offsetCoordsMeters({ lat, lng }, 6, -8);
      const initB = offsetCoordsMeters({ lat, lng }, -4, 6);
      setMarkerA(initA);
      setMarkerB(initB);
      setActiveClickTarget('A');
      setEnedisNotice(
        'Déplacez le marqueur A sur le transformateur électrique, et le marqueur B sur l’emplacement souhaité sur votre terrain.'
      );
    } finally {
      setIsLoadingEnedis(false);
    }
  }, []);

  // Sélection d'une adresse depuis l'autocomplétion
  const handleSelectAddressFeature = (feature) => {
    const [lng, lat] = feature.geometry.coordinates;
    const label = feature.properties.label;
    setSelectedAddress(label);
    setAddressQuery(label);
    setSuggestions([]);
    setAddressError('');
    setMapCenter({ lat, lng });
    fetchNearbyEnedisTransformers(lat, lng);
    setStep(2);
  };

  // Soumission manuelle du champ d'adresse
  const handleAddressFormSubmit = async (e) => {
    e.preventDefault();
    if (!addressQuery.trim()) {
      setAddressError('Veuillez saisir une adresse, un lieu-dit ou une commune.');
      return;
    }
    if (suggestions.length > 0) {
      handleSelectAddressFeature(suggestions[0]);
      return;
    }
    setIsSearchingAddress(true);
    setAddressError('');
    try {
      const res = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(addressQuery.trim())}&limit=1`
      );
      const data = await res.json();
      if (data?.features?.length > 0) {
        handleSelectAddressFeature(data.features[0]);
      } else {
        setAddressError('Adresse introuvable. Essayez avec le code postal et la commune.');
      }
    } catch {
      setAddressError('Erreur lors de la recherche. Veuillez réessayer.');
    } finally {
      setIsSearchingAddress(false);
    }
  };

  // Géolocalisation GPS directe
  const handleUseGpsLocation = () => {
    if (!navigator.geolocation) {
      setAddressError("La géolocalisation GPS n'est pas supportée par votre navigateur.");
      return;
    }
    setIsLocatingGps(true);
    setAddressError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        let label = `Position GPS (${lat.toFixed(5)}, ${lng.toFixed(5)})`;
        try {
          const res = await fetch(`https://api-adresse.data.gouv.fr/reverse/?lon=${lng}&lat=${lat}`);
          const data = await res.json();
          if (data?.features?.length > 0) {
            label = data.features[0].properties.label;
          }
        } catch {
          // Fallback coordonnées brutes
        }
        setSelectedAddress(label);
        setAddressQuery(label);
        setMapCenter({ lat, lng });
        fetchNearbyEnedisTransformers(lat, lng);
        setIsLocatingGps(false);
        setStep(2);
      },
      () => {
        setIsLocatingGps(false);
        setAddressError(
          "Impossible d'obtenir votre position GPS. Vérifiez les autorisations ou saisissez votre adresse."
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Gestion de l'upload photo du transformateur
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setTransformerPhoto(file);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoPreviewUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Envoi du formulaire de contact (Étape 4) vers Formspree
  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !email.trim()) {
      setSubmitError('Veuillez renseigner votre nom, votre téléphone et votre adresse email.');
      return;
    }

    setIsSubmittingLead(true);
    setSubmitError('');

    try {
      const gmapsTransfoUrl = markerA
        ? `https://www.google.com/maps?q=${markerA.lat.toFixed(6)},${markerA.lng.toFixed(6)}`
        : 'Non défini';
      const gmapsTerrainUrl = markerB
        ? `https://www.google.com/maps?q=${markerB.lat.toFixed(6)},${markerB.lng.toFixed(6)}`
        : 'Non défini';

      const payload = {
        _subject: `[SIMULATEUR BATTERIE] ${fullName} — ${distanceMeters ?? '?'}m (${
          eligibilityStatus === 'eligible' ? 'ÉLIGIBLE' : 'ÉTUDE'
        })`,
        source: 'Simulateur Éligibilité Batterie de Soutien Réseau (/batterie-soutien-reseau)',
        nomPrenom: fullName.trim(),
        telephone: phone.trim(),
        email: email.trim(),
        profilProprietaire: ownerProfile,
        adresseTerrain: selectedAddress || addressQuery,
        distanceMesureeMetres: `${distanceMeters ?? 'Non mesurée'} m`,
        statutEligibilite:
          eligibilityStatus === 'eligible'
            ? 'ÉLIGIBLE'
            : eligibilityStatus === 'borderline'
            ? `CAS LIMITE DÉROGATOIRE (${distanceMeters} m)`
            : `ÉTUDE SPÉCIFIQUE (${distanceMeters} m)`,
        surfaceLouee: '20 m²',
        remunerationGarantie: '2 000 € / an pendant 20 ans (40 000 € cumulés)',
        coordonneesGpsTransformateurA: markerA
          ? `${markerA.lat.toFixed(6)}, ${markerA.lng.toFixed(6)}`
          : 'Non défini',
        lienGoogleMapsTransformateurA: gmapsTransfoUrl,
        coordonneesGpsTerrainB: markerB
          ? `${markerB.lat.toFixed(6)}, ${markerB.lng.toFixed(6)}`
          : 'Non défini',
        lienGoogleMapsTerrainB: gmapsTerrainUrl,
        commentaire: comments.trim() || 'Aucun commentaire',
        photoTransformateurNom: transformerPhoto ? transformerPhoto.name : 'Aucune photo jointe',
      };

      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'envoi du formulaire");
      }

      setLeadSubmitted(true);
    } catch {
      setSubmitError(
        "Une erreur est survenue lors de l'envoi. Vous pouvez également nous appeler directement au 06 27 89 49 77."
      );
    } finally {
      setIsSubmittingLead(false);
    }
  };

  // Partage du lien du simulateur
  const handleCopyShareLink = () => {
    const shareUrl = 'https://www.enr-courtage.fr/batterie-soutien-reseau?mode=simulateur#simulateur-eligibilite';
    navigator.clipboard?.writeText(shareUrl);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 3000);
  };

  return (
    <section
      id="simulateur-eligibilite"
      className="py-12 md:py-20 bg-gradient-to-b from-slate-900 via-slate-900 to-blue-950 text-white relative overflow-hidden scroll-mt-16"
      aria-labelledby="simulator-heading"
    >
      {/* Halo lumineux d'arrière-plan */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Bandeau compact spécial mode Facebook / Direct */}
        {isDirectMode && (
          <div className="mb-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-3 rounded-2xl shadow-lg border border-emerald-400/40 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-sm sm:text-base font-bold">
              <Sparkles className="w-5 h-5 text-yellow-300 shrink-0" />
              <span>
                Testez l&apos;éligibilité de votre terrain en 30 secondes et découvrez le montant de votre rente
                annuelle garantie
              </span>
            </div>
            <span className="text-xs font-extrabold uppercase tracking-wider bg-black/25 px-3 py-1 rounded-full">
              0 € d&apos;investissement
            </span>
          </div>
        )}

        {/* En-tête du Simulateur (sans dévoiler le montant avant la simulation) */}
        <div className="text-center mb-8 md:mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs sm:text-sm font-bold uppercase tracking-wider mb-4">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>Simulateur officiel ENR COURTAGE • Réponse immédiate</span>
          </div>
          <h2
            id="simulator-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-4"
          >
            Vérifiez l&apos;éligibilité de votre terrain en{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-300">
              30 secondes
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto">
            Localisez votre parcelle sur la carte satellite et découvrez immédiatement votre éligibilité ainsi que le
            montant de votre rente annuelle garantie, 100 % financée et installée par ENR COURTAGE.
          </p>
        </div>

        {/* Barre de progression des 4 étapes */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="grid grid-cols-4 gap-2">
            {[
              { num: 1, label: '1. Adresse' },
              { num: 2, label: '2. Carte satellite' },
              { num: 3, label: '3. Votre Rente' },
              { num: 4, label: '4. Validation' },
            ].map((item) => {
              const isActive = step === item.num;
              const isDone = step > item.num;
              return (
                <button
                  key={item.num}
                  type="button"
                  onClick={() => {
                    if (item.num < step || (item.num === 2 && selectedAddress)) {
                      setStep(item.num);
                    }
                  }}
                  className={`py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 border ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/25'
                      : isDone
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 cursor-pointer'
                      : 'bg-slate-800/70 text-slate-400 border-slate-700 cursor-default'
                  }`}
                >
                  {isDone && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Conteneur Principal du Wizard */}
        <div className="bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* =============================================================== */}
          {/* ÉTAPE 1 : RECHERCHE DE L'ADRESSE DU TERRAIN                     */}
          {/* =============================================================== */}
          {step === 1 && (
            <div className="p-6 sm:p-10 md:p-12">
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="text-center space-y-2">
                  <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-xs uppercase tracking-wider">
                    Étape 1 sur 4 • Localisation de la parcelle
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    Où se situe votre terrain ?
                  </h3>
                  <p className="text-slate-600 text-sm sm:text-base">
                    Saisissez l&apos;adresse de votre propriété ou utilisez votre position GPS pour afficher la vue
                    satellite haute résolution et lancer la simulation.
                  </p>
                </div>

                <form onSubmit={handleAddressFormSubmit} className="space-y-4">
                  <div className="relative">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <MapPin className="w-5 h-5 text-blue-600 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={addressQuery}
                          onChange={(e) => setAddressQuery(e.target.value)}
                          placeholder="Ex : 12 Route des Vignes, 33700 Mérignac..."
                          style={{
                            color: '#0f172a',
                            WebkitTextFillColor: '#0f172a',
                            backgroundColor: '#ffffff',
                            colorScheme: 'light',
                          }}
                          className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 text-base font-medium text-slate-900 placeholder-slate-400 outline-none transition"
                        />
                        {isSearchingAddress && (
                          <Loader2 className="w-5 h-5 text-blue-600 animate-spin absolute right-4 top-1/2 -translate-y-1/2" />
                        )}
                      </div>

                      <button
                        type="submit"
                        className="px-6 py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-base shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
                      >
                        <Search className="w-5 h-5" />
                        <span>Voir sur la carte</span>
                      </button>
                    </div>

                    {/* Liste d'autocomplétion API Adresse data.gouv.fr */}
                    {suggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden divide-y divide-slate-100">
                        {suggestions.map((feat) => (
                          <button
                            key={feat.properties.id}
                            type="button"
                            onClick={() => handleSelectAddressFeature(feat)}
                            className="w-full px-4 py-3.5 text-left hover:bg-blue-50 flex items-center gap-3 transition cursor-pointer"
                          >
                            <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                            <div>
                              <div className="font-bold text-slate-900 text-sm">
                                {feat.properties.label}
                              </div>
                              <div className="text-xs text-slate-500">
                                {feat.properties.context}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {addressError && (
                    <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{addressError}</span>
                    </div>
                  )}

                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-slate-200" />
                    <span className="flex-shrink mx-4 text-xs font-bold uppercase text-slate-400">
                      ou sur le terrain
                    </span>
                    <div className="flex-grow border-t border-slate-200" />
                  </div>

                  <button
                    type="button"
                    onClick={handleUseGpsLocation}
                    disabled={isLocatingGps}
                    className="w-full py-3.5 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition flex items-center justify-center gap-2 border border-slate-300 cursor-pointer"
                  >
                    {isLocatingGps ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        <span>Localisation GPS en cours...</span>
                      </>
                    ) : (
                      <>
                        <Navigation className="w-4 h-4 text-blue-600" />
                        <span>Utiliser ma position GPS actuelle</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* ÉTAPE 2 : CARTE SATELLITE INTERACTIVE                           */}
          {/* =============================================================== */}
          {step === 2 && (
            <div className="p-5 sm:p-8 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
                <div>
                  <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-xs uppercase tracking-wider mb-1">
                    Étape 2 sur 4 • Localisation Satellite
                  </span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                    Positionnez le transformateur (A) et votre terrain (B)
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="font-semibold text-slate-800">{selectedAddress}</span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Changer d&apos;adresse</span>
                </button>
              </div>

              {/* Bandeau d'information Enedis */}
              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs sm:text-sm text-blue-950 flex items-start gap-2.5">
                {isLoadingEnedis ? (
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0 mt-0.5" />
                ) : (
                  <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <strong>Aide au repérage :</strong>{' '}
                  {isLoadingEnedis
                    ? 'Recherche des transformateurs électriques autour de votre parcelle...'
                    : enedisNotice}
                </div>
              </div>

              {/* Sélecteur de mode de clic rapide (idéal mobile & desktop) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setActiveClickTarget('A')}
                  className={`p-3.5 rounded-2xl border-2 text-left transition flex items-center justify-between cursor-pointer ${
                    activeClickTarget === 'A'
                      ? 'border-orange-500 bg-orange-50 shadow-md'
                      : 'border-slate-200 hover:border-orange-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-orange-500 text-white font-black text-sm flex items-center justify-center shrink-0">
                      A
                    </span>
                    <div>
                      <div className="font-extrabold text-slate-900 text-xs sm:text-sm">
                        Marqueur A : Transformateur électrique
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Cliquez sur la carte ou glissez A sur le transformateur
                      </div>
                    </div>
                  </div>
                  {activeClickTarget === 'A' && (
                    <span className="text-[10px] font-black uppercase bg-orange-500 text-white px-2 py-0.5 rounded-full">
                      Actif
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveClickTarget('B')}
                  className={`p-3.5 rounded-2xl border-2 text-left transition flex items-center justify-between cursor-pointer ${
                    activeClickTarget === 'B'
                      ? 'border-emerald-500 bg-emerald-50 shadow-md'
                      : 'border-slate-200 hover:border-emerald-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                      B
                    </span>
                    <div>
                      <div className="font-extrabold text-slate-900 text-xs sm:text-sm">
                        Marqueur B : Emplacement sur mon terrain
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Cliquez sur la carte ou glissez B sur votre parcelle
                      </div>
                    </div>
                  </div>
                  {activeClickTarget === 'B' && (
                    <span className="text-[10px] font-black uppercase bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                      Actif
                    </span>
                  )}
                </button>
              </div>

              {/* Carte Satellite Interactive */}
              <div className="relative rounded-2xl overflow-hidden border-2 border-slate-300 shadow-inner">
                <BessInteractiveMap
                  mapCenter={mapCenter}
                  markerA={markerA}
                  markerB={markerB}
                  setMarkerA={setMarkerA}
                  setMarkerB={setMarkerB}
                  activeClickTarget={activeClickTarget}
                  setActiveClickTarget={setActiveClickTarget}
                  enedisPostes={enedisPostes}
                />

                {/* Jauge de distance en direct superposée */}
                <div className="absolute bottom-3 left-3 right-3 sm:right-auto z-[400] bg-slate-900/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-xl border border-white/15 flex items-center justify-between sm:justify-start gap-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                      Distance A ↔ B mesurée en direct
                    </div>
                    <div className="text-xl sm:text-2xl font-black flex items-center gap-2">
                      <span>{distanceMeters !== null ? `${distanceMeters} m` : '—'}</span>
                      {distanceMeters !== null && distanceMeters <= 30 && (
                        <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950">
                          ✓ Zone optimale
                        </span>
                      )}
                      {distanceMeters !== null && distanceMeters > 30 && (
                        <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950">
                          Étude spécifique
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Boutons de navigation Étape 2 -> Étape 3 */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const initA = offsetCoordsMeters(mapCenter, 6, -8);
                    const initB = offsetCoordsMeters(mapCenter, -4, 6);
                    setMarkerA(initA);
                    setMarkerB(initB);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Réinitialiser les marqueurs</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm sm:text-base shadow-xl transition flex items-center gap-2 cursor-pointer"
                >
                  <span>Découvrir mon éligibilité & ma rente</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* ÉTAPE 3 : RÉSULTAT DE LA SIMULATION & RÉVÉLATION DE LA RENTE    */}
          {/* =============================================================== */}
          {step === 3 && (
            <div className="p-6 sm:p-10 space-y-6">
              {/* Cas 1 : Éligible */}
              {eligibilityStatus === 'eligible' && (
                <div className="bg-emerald-50 border-2 border-emerald-500 rounded-3xl p-6 sm:p-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <span className="inline-block px-4 py-1 rounded-full bg-emerald-200 text-emerald-900 font-black text-xs uppercase tracking-widest">
                    Distance mesurée : {distanceMeters} mètres
                  </span>
                  <h3 className="text-3xl sm:text-4xl font-black text-emerald-950">
                    Félicitations, votre terrain est Éligible !
                  </h3>
                  <p className="text-slate-700 max-w-2xl mx-auto text-sm sm:text-base">
                    Votre emplacement de <strong>20 m²</strong> situé à <strong>{distanceMeters} m</strong> du
                    transformateur électrique vous permet de bénéficier d&apos;une rente garantie de{' '}
                    <strong>2 000 € / an pendant 20 ans</strong>.
                  </p>
                </div>
              )}

              {/* Cas 2 : Cas Limite / Étude */}
              {eligibilityStatus !== 'eligible' && (
                <div className="bg-amber-50 border-2 border-amber-500 rounded-3xl p-6 sm:p-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-amber-500 text-white flex items-center justify-center mx-auto shadow-lg">
                    <AlertTriangle className="w-10 h-10" />
                  </div>
                  <span className="inline-block px-4 py-1 rounded-full bg-amber-200 text-amber-950 font-black text-xs uppercase tracking-widest">
                    Distance mesurée : {distanceMeters} mètres
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-amber-950">
                    Éligibilité sous réserve d&apos;étude technique
                  </h3>
                  <p className="text-slate-800 max-w-2xl mx-auto text-sm sm:text-base font-medium">
                    L&apos;emplacement sélectionné se situe à <strong>{distanceMeters} m</strong> du transformateur.
                    Déposez votre dossier pour qu&apos;un ingénieur ENR COURTAGE vérifie la faisabilité de raccordement
                    sur votre parcelle.
                  </p>
                </div>
              )}

              {/* Récapitulatif Financier Dynamique (Révélé uniquement après simulation) */}
              <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2.5">
                    <Coins className="w-6 h-6 text-amber-400" />
                    <h4 className="text-lg sm:text-xl font-black">
                      Résultat de votre simulation : Offre de Location Garantie
                    </h4>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    0 € à débourser • 100 % financé par ENR COURTAGE
                  </span>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <span className="text-xs text-slate-400 uppercase font-bold block">Surface mobilisée</span>
                    <span className="text-2xl sm:text-3xl font-black text-white mt-1 block">20 m²</span>
                    <span className="text-[11px] text-emerald-400">Clôture rigide verte incluse</span>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <span className="text-xs text-slate-400 uppercase font-bold block">Rente annuelle</span>
                    <span className="text-2xl sm:text-3xl font-black text-amber-400 mt-1 block">2 000 € / an</span>
                    <span className="text-[11px] text-slate-300">Versée chaque année</span>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <span className="text-xs text-slate-400 uppercase font-bold block">Durée du contrat</span>
                    <span className="text-2xl sm:text-3xl font-black text-white mt-1 block">20 ans</span>
                    <span className="text-[11px] text-slate-300">Bail emphytéotique / civil</span>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-4 shadow-lg border border-emerald-400/40">
                    <span className="text-xs text-emerald-100 uppercase font-bold block">Revenu total cumulé</span>
                    <span className="text-2xl sm:text-3xl font-black text-white mt-1 block">40 000 €</span>
                    <span className="text-[11px] text-emerald-100 font-semibold">Nets d&apos;investissement</span>
                  </div>
                </div>

                <div className="text-xs sm:text-sm text-slate-300 bg-white/5 rounded-2xl p-4 border border-white/10 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Engagement clé en main ENR COURTAGE :</strong> Frais d&apos;étude, dalle béton, 4 armoires
                    batteries CESC, clôture en grillage rigide vert, raccordement Enedis, assurance et maintenance sur
                    20 ans sont <strong>100 % pris en charge par ENR COURTAGE</strong>.
                  </span>
                </div>
              </div>

              {/* Boutons d'action Étape 3 */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Ajuster les marqueurs sur la carte</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-8 py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-base shadow-xl transition flex items-center gap-2 cursor-pointer"
                >
                  <span>Recevoir mon étude & valider mon dossier</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* ÉTAPE 4 : FORMULAIRE DE CONTACT & CAPTURE DU LEAD               */}
          {/* =============================================================== */}
          {step === 4 && (
            <div className="p-6 sm:p-10">
              {leadSubmitted ? (
                <div className="max-w-xl mx-auto text-center py-8 space-y-5">
                  <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900">
                    Votre dossier d&apos;éligibilité a bien été transmis !
                  </h3>
                  <p className="text-slate-600 text-base leading-relaxed">
                    Merci <strong>{fullName}</strong>. Nos ingénieurs réseau <strong>ENR COURTAGE</strong> analysent
                    les coordonnées GPS de votre parcelle ({selectedAddress}) et vous recontactent sous{' '}
                    <strong>24h ouvrées</strong> pour confirmer la mise en place de votre rente de{' '}
                    <strong>2 000 € / an pendant 20 ans</strong>.
                  </p>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 space-y-1 text-left">
                    <div>
                      <strong>Adresse :</strong> {selectedAddress}
                    </div>
                    <div>
                      <strong>Distance mesurée :</strong> {distanceMeters} mètres
                    </div>
                    <div>
                      <strong>Rémunération :</strong> 2 000 € / an pendant 20 ans (40 000 € garantis pour 20 m²)
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setLeadSubmitted(false);
                      setStep(1);
                    }}
                    className="px-6 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm cursor-pointer"
                  >
                    Faire une nouvelle simulation
                  </button>
                </div>
              ) : (
                <div className="max-w-2xl mx-auto space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-200">
                    <div>
                      <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs uppercase tracking-wider mb-1">
                        Étape 4 sur 4 • Validation de votre rente de 2 000 €/an
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                        Où pouvons-nous vous envoyer votre proposition de bail ?
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Retour au résultat</span>
                    </button>
                  </div>

                  {/* Rappel synthétique de la simulation */}
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
                    <div>
                      <div className="font-bold text-emerald-950">{selectedAddress}</div>
                      <div className="text-emerald-800">
                        Distance mesurée : <strong>{distanceMeters} m</strong> • Surface :{' '}
                        <strong>20 m²</strong>
                      </div>
                    </div>
                    <div className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-black">
                      2 000 € / an × 20 ans (40 000 €)
                    </div>
                  </div>

                  <form onSubmit={handleLeadSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                          Nom et Prénom *
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Jean Dupont"
                            style={{
                              color: '#0f172a',
                              WebkitTextFillColor: '#0f172a',
                              backgroundColor: '#ffffff',
                              colorScheme: 'light',
                            }}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:border-blue-600 text-sm font-medium text-slate-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                          Téléphone *
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="06 12 34 56 78"
                            style={{
                              color: '#0f172a',
                              WebkitTextFillColor: '#0f172a',
                              backgroundColor: '#ffffff',
                              colorScheme: 'light',
                            }}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:border-blue-600 text-sm font-medium text-slate-900"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                          Adresse Email *
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="jean.dupont@email.fr"
                            style={{
                              color: '#0f172a',
                              WebkitTextFillColor: '#0f172a',
                              backgroundColor: '#ffffff',
                              colorScheme: 'light',
                            }}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:border-blue-600 text-sm font-medium text-slate-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                          Votre Profil *
                        </label>
                        <div className="relative">
                          <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <select
                            value={ownerProfile}
                            onChange={(e) => setOwnerProfile(e.target.value)}
                            style={{
                              color: '#0f172a',
                              backgroundColor: '#ffffff',
                              colorScheme: 'light',
                            }}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:border-blue-600 text-sm font-bold text-slate-900"
                          >
                            <option value="Propriété agricole">Propriété agricole</option>
                            <option value="Site industriel ou entreprise">Site industriel ou entreprise</option>
                            <option value="Propriétaire foncier particulier">Propriétaire foncier particulier</option>
                            <option value="Collectivité">Collectivité</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Upload photo du transformateur (optionnel) */}
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                        Photo du transformateur (optionnel — très utile sur mobile)
                      </label>
                      <label className="flex items-center justify-between p-3.5 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 cursor-pointer transition">
                        <div className="flex items-center gap-3">
                          <Camera className="w-5 h-5 text-blue-600 shrink-0" />
                          <span className="text-xs sm:text-sm text-slate-700 font-medium">
                            {transformerPhoto
                              ? `Photo sélectionnée : ${transformerPhoto.name}`
                              : 'Prendre ou joindre une photo du transformateur'}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-blue-600 px-3 py-1 rounded-lg bg-blue-100">
                          Parcourir
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
                      </label>
                      {photoPreviewUrl && (
                        <div className="mt-2 flex items-center gap-3">
                          <img
                            src={photoPreviewUrl}
                            alt="Aperçu du transformateur"
                            className="w-16 h-16 rounded-lg object-cover border border-slate-300"
                          />
                          <span className="text-xs text-emerald-700 font-semibold">
                            ✓ Photo prête à être jointe à votre dossier
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                        Commentaire ou précision (optionnel)
                      </label>
                      <textarea
                        rows={3}
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder="Précisions sur l'accès au terrain, le numéro de parcelle ou vos disponibilités..."
                        style={{
                          color: '#0f172a',
                          WebkitTextFillColor: '#0f172a',
                          backgroundColor: '#ffffff',
                          colorScheme: 'light',
                        }}
                        className="w-full p-3.5 rounded-xl border border-slate-300 focus:border-blue-600 text-sm text-slate-900"
                      />
                    </div>

                    {submitError && (
                      <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium">
                        {submitError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmittingLead}
                      className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-base shadow-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmittingLead ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Transmission de votre dossier en cours...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          <span>Valider ma demande de rente (2 000 € / an pendant 20 ans)</span>
                        </>
                      )}
                    </button>

                    <p className="text-[11px] text-center text-slate-500">
                      Étude 100 % gratuite et sans engagement • Vos coordonnées GPS ({distanceMeters} m) sont jointes
                      automatiquement pour validation par un ingénieur ENR COURTAGE.
                    </p>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Barre de partage rapide Facebook / Lien direct */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
          <span>Vous connaissez un propriétaire disposant d&apos;un terrain proche d&apos;un transformateur ?</span>
          <button
            type="button"
            onClick={handleCopyShareLink}
            className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{shareCopied ? 'Lien copié !' : 'Partager ce simulateur'}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
