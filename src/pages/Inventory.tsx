import { useState } from 'react';
import { useRequireAuth } from '@/lib/auth';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PackagePlus } from 'lucide-react';
import { usePagination } from '@/hooks/use-pagination';
import PaginationComponent from '@/components/common/PaginationComponent';
import { useInventory, ClothingItem, NewClothingItem } from '@/hooks/use-inventory';
import { InventoryItemForm } from '@/components/inventory/InventoryItemForm';
import { InventoryItem } from '@/components/inventory/InventoryItem';
import { ItemDetailsDialog } from '@/components/inventory/ItemDetailsDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ITEMS_PER_PAGE = 9;

const Inventory = () => {
  useRequireAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);

  const { 
    currentPage, 
    pageItems, 
    totalPages, 
    goToNextPage, 
    goToPreviousPage, 
    goToPage 
  } = usePagination({ 
    totalItems: 0, 
    itemsPerPage: ITEMS_PER_PAGE 
  });

  const {
    items,
    totalItems,
    isLoading,
    isSubmitting,
    addItem,
    updateItem,
    deleteItem
  } = useInventory(currentPage, ITEMS_PER_PAGE);

  const handleView = (item: ClothingItem) => {
    setSelectedItem(item);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (item: ClothingItem) => {
    setSelectedItem(item);
    setIsEditDialogOpen(true);
  };

  const handleDeleteConfirm = (item: ClothingItem) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    
    const success = await deleteItem(selectedItem.id);
    if (success) {
      setIsDeleteDialogOpen(false);
      setSelectedItem(null);
    }
  };

  const handleAdd = async (data: NewClothingItem) => {
    const success = await addItem(data);
    if (success) {
      setIsAddDialogOpen(false);
    }
  };

  const handleUpdate = async (data: ClothingItem) => {
    const success = await updateItem(data);
    if (success) {
      setIsEditDialogOpen(false);
      setSelectedItem(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Inventory</h1>
          <Button 
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <PackagePlus className="mr-1" /> Add New Item
          </Button>
        </div>

        {/* Add Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Inventory Item</DialogTitle>
            </DialogHeader>
            <InventoryItemForm
              onSubmit={handleAdd}
              onCancel={() => setIsAddDialogOpen(false)}
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Inventory Item</DialogTitle>
            </DialogHeader>
            <InventoryItemForm
              initialData={selectedItem}
              onSubmit={handleUpdate}
              onCancel={() => setIsEditDialogOpen(false)}
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        </Dialog>

        {/* View Dialog */}
        <ItemDetailsDialog
          item={selectedItem}
          isOpen={isViewDialogOpen}
          onClose={() => {
            setIsViewDialogOpen(false);
            setSelectedItem(null);
          }}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete this item?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the item{' '}
                <span className="font-bold">{selectedItem?.name}</span> from your inventory.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete} 
                className="bg-red-500 hover:bg-red-600"
              >
                {isSubmitting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-lg shadow p-4 h-96" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.length === 0 ? (
                <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
                  <p className="text-gray-500">No inventory items found.</p>
                  <p className="mt-2">Add your first item to get started.</p>
                </div>
              ) : (
                items.map((item) => (
                  <InventoryItem
                    key={item.id}
                    item={item}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDeleteConfirm}
                  />
                ))
              )}
            </div>

            {/* Pagination Component */}
            <PaginationComponent
              currentPage={currentPage}
              pageItems={pageItems}
              totalPages={totalPages}
              onPageChange={goToPage}
              onPrevious={goToPreviousPage}
              onNext={goToNextPage}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Inventory;
