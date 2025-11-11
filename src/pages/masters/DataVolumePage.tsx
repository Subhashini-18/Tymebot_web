import React from 'react';
import { MasterScreen } from '@/components/common/MasterScreen';

const DataVolumePage: React.FC = () => {
  const columns = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      filterable: true,
      filterType: 'text'
    },
    {
      key: 'dataVolumeName',
      label: 'Data Volume Name',
      sortable: true,
      filterable: true,
      filterType: 'text'
    },
    {
      key: 'description',
      label: 'Description',
      sortable: true,
      filterable: true,
      filterType: 'text'
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (row: any) => (row.isActive ? 
        <span className='text-green-600 font-sm'>Active</span> : 
        <span className='text-red-600 font-sm'>Inactive</span>
      ),
      sortable: true,
      filterable: true,
    }
  ];

  const formFields = [
    {
      name: 'dataVolumeName',
      label: 'Data Volume Name',
      type: 'text',
      placeholder: 'Enter volume name',
      required: true,
      validation: {
        minLength: 2,
        maxLength: 100,
        errorMessage: 'Volume name must be between 2 and 100 characters'
      }
    },
    {
      name: 'description',
      label: 'Description',
      type: 'text',
      placeholder: 'Enter description',
      required: false,
      validation: {
        maxLength: 500,
        errorMessage: 'Description must not exceed 500 characters'
      }
    },
    {
      name: 'isActive',
      label: 'Active Status',
      type: 'checkbox',
      required: false,
    }
  ];

  return (
    <MasterScreen
      title="Data Volume"
      endpoint="data_volume"
      columns={columns}
      formFields={formFields}
      searchPlaceholder="Search data volumes by code, name..."
    />
  );
};

export default DataVolumePage;