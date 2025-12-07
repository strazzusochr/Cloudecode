import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAssetStore, Asset } from '../../src/stores/assetStore';

export default function AssetManagerScreen() {
  const {
    assets,
    addAsset,
    removeAsset,
    updateAsset,
    searchTerm,
    setSearchTerm,
  } = useAssetStore();

  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [editName, setEditName] = useState('');
  const [editTags, setEditTags] = useState('');

  const filteredAssets = assets.filter(
    (asset) =>
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleImportModel = useCallback(async () => {
    if (Platform.OS !== 'web') {
      Alert.alert('Info', 'Model import is only available on web');
      return;
    }

    setIsImporting(true);

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.glb,.gltf';

    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) {
        setIsImporting(false);
        return;
      }

      const reader = new FileReader();
      reader.onload = async (event) => {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        const blob = new Blob([arrayBuffer], { type: 'model/gltf-binary' });
        const url = URL.createObjectURL(blob);

        const newAsset: Asset = {
          id: Date.now().toString(),
          name: file.name.replace(/\.(glb|gltf)$/, ''),
          url,
          tags: [],
          thumbnail: '',
          createdAt: new Date().toISOString(),
        };

        addAsset(newAsset);
        setIsImporting(false);
        Alert.alert('Success', `Imported: ${newAsset.name}`);
      };

      reader.readAsArrayBuffer(file);
    };

    input.click();
  }, [addAsset]);

  const handleDeleteAsset = useCallback(
    (id: string) => {
      Alert.alert('Confirm Delete', 'Are you sure you want to delete this asset?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            removeAsset(id);
            if (selectedAsset?.id === id) {
              setSelectedAsset(null);
            }
          },
        },
      ]);
    },
    [removeAsset, selectedAsset]
  );

  const handleSelectAsset = useCallback((asset: Asset) => {
    setSelectedAsset(asset);
    setEditName(asset.name);
    setEditTags(asset.tags.join(', '));
  }, []);

  const handleSaveMetadata = useCallback(() => {
    if (!selectedAsset) return;

    updateAsset(selectedAsset.id, {
      name: editName,
      tags: editTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    });

    Alert.alert('Saved', 'Asset metadata updated');
  }, [selectedAsset, editName, editTags, updateAsset]);

  const renderAsset = ({ item }: { item: Asset }) => (
    <TouchableOpacity
      style={[styles.assetCard, selectedAsset?.id === item.id && styles.assetCardSelected]}
      onPress={() => handleSelectAsset(item)}
      activeOpacity={0.7}
    >
      <View style={styles.assetThumbnail}>
        <Text style={styles.assetIcon}>📦</Text>
      </View>
      <View style={styles.assetInfo}>
        <Text style={styles.assetName}>{item.name}</Text>
        <Text style={styles.assetTags}>
          {item.tags.length > 0 ? item.tags.join(', ') : 'No tags'}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteAsset(item.id)}
      >
        <Text style={styles.deleteButtonText}>X</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{'<'} BACK</Text>
        </TouchableOpacity>
        <Text style={styles.title}>3D ASSET MANAGER</Text>
        <TouchableOpacity
          style={[styles.importButton, isImporting && styles.importButtonDisabled]}
          onPress={handleImportModel}
          disabled={isImporting}
        >
          <Text style={styles.importButtonText}>
            {isImporting ? 'IMPORTING...' : '+ IMPORT'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="Search by name or tags..."
          placeholderTextColor="#666"
        />
      </View>

      <View style={styles.content}>
        {/* Asset List */}
        <View style={styles.listContainer}>
          <FlatList
            data={filteredAssets}
            renderItem={renderAsset}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No assets found</Text>
                <Text style={styles.emptySubtext}>
                  Import a .glb model to get started
                </Text>
              </View>
            }
          />
        </View>

        {/* Preview & Metadata Panel */}
        <View style={styles.previewPanel}>
          {selectedAsset ? (
            <>
              <View style={styles.previewContainer}>
                <Text style={styles.previewPlaceholder}>
                  3D Preview
                </Text>
                <Text style={styles.previewSubtext}>
                  (WebGL viewer placeholder)
                </Text>
              </View>

              <View style={styles.metadataContainer}>
                <Text style={styles.metadataTitle}>Edit Metadata</Text>
                <TextInput
                  style={styles.metadataInput}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Asset name"
                  placeholderTextColor="#666"
                />
                <TextInput
                  style={styles.metadataInput}
                  value={editTags}
                  onChangeText={setEditTags}
                  placeholder="Tags (comma separated)"
                  placeholderTextColor="#666"
                />
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveMetadata}
                >
                  <Text style={styles.saveButtonText}>SAVE</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.noSelectionContainer}>
              <Text style={styles.noSelectionText}>Select an asset to preview</Text>
            </View>
          )}
        </View>
      </View>

      {/* Stats Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {assets.length} assets in library
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a5e',
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#9C27B0',
    letterSpacing: 2,
  },
  importButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
  },
  importButtonDisabled: {
    opacity: 0.5,
  },
  importButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  searchContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a5e',
  },
  searchInput: {
    backgroundColor: '#2a2a4e',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  listContainer: {
    width: 300,
    borderRightWidth: 1,
    borderRightColor: '#3a3a5e',
  },
  assetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a5e',
  },
  assetCardSelected: {
    backgroundColor: '#3a3a6e',
  },
  assetThumbnail: {
    width: 50,
    height: 50,
    backgroundColor: '#2a2a4e',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  assetIcon: {
    fontSize: 24,
  },
  assetInfo: {
    flex: 1,
    marginLeft: 12,
  },
  assetName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  assetTags: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  deleteButton: {
    padding: 10,
  },
  deleteButtonText: {
    color: '#f44336',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptySubtext: {
    color: '#888',
    fontSize: 12,
    marginTop: 5,
  },
  previewPanel: {
    flex: 1,
    padding: 15,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#0a0a1e',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewPlaceholder: {
    color: '#666',
    fontSize: 24,
    fontWeight: 'bold',
  },
  previewSubtext: {
    color: '#444',
    fontSize: 12,
    marginTop: 5,
  },
  metadataContainer: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#2a2a4e',
    borderRadius: 12,
  },
  metadataTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  metadataInput: {
    backgroundColor: '#1a1a2e',
    color: '#fff',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  noSelectionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noSelectionText: {
    color: '#666',
    fontSize: 16,
  },
  footer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#3a3a5e',
    alignItems: 'center',
  },
  footerText: {
    color: '#888',
    fontSize: 12,
  },
});
