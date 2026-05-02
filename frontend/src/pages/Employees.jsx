import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { FiUsers, FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiPhone, FiDollarSign, FiClock } from 'react-icons/fi';
import { toast } from 'react-toastify';

const roles = ['Manager', 'Cashier', 'Chef', 'Waiter', 'Cleaner', 'Security', 'Driver', 'Other'];
const shifts = ['Morning (6am-2pm)', 'Afternoon (2pm-10pm)', 'Night (10pm-6am)', 'Full Day'];

const emptyForm = { name: '', role: 'Cashier', phone: '', salary: '', shift: 'Morning (6am-2pm)' };

const Employees = () => {
  const { user } = useAuth();
  // No demo data - empty array for clean start
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editEmp, setEditEmp] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const totalPayroll = employees.filter(e => e.status !== 'terminated').reduce((s, e) => s + e.salary, 0);
  const activeCount = employees.filter(e => e.status === 'active').length;
  const onLeave = employees.filter(e => e.status === 'on_leave').length;

  const filtered = employees.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.role.toLowerCase().includes(search.toLowerCase()) || e.phone.includes(search);
    const matchRole = roleFilter === 'all' || e.role === roleFilter;
    return matchSearch && matchRole;
  });

  const openAdd = () => { setEditEmp(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (e) => { setEditEmp(e); setForm({ name: e.name, role: e.role, phone: e.phone, salary: e.salary, shift: e.shift }); setShowModal(true); };

  const handleSave = () => {
    if (!form.name || !form.phone) { toast.error('Name and phone are required'); return; }
    if (editEmp) {
      setEmployees(prev => prev.map(e => e.id === editEmp.id ? { ...e, ...form, salary: Number(form.salary) } : e));
      toast.success('Employee updated');
    } else {
      setEmployees(prev => [...prev, {
        id: Date.now(), ...form, salary: Number(form.salary),
        status: 'active', startDate: new Date().toISOString().split('T')[0], attendance: 100
      }]);
      toast.success('Employee added');
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
    toast.success('Employee removed');
  };

  const statusColors = {
    active: 'bg-green-500/10 text-green-400',
    on_leave: 'bg-yellow-500/10 text-yellow-400',
    terminated: 'bg-red-500/10 text-red-400'
  };

  const inputClass = 'w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500';

  return (
    <div className="flex min-h-screen bg-gray-900">
      <Sidebar user={user} />
      <div className="flex-1 pt-16 md:pt-0 p-4 md:p-8 overflow-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Employees</h1>
            <p className="text-gray-400 text-sm mt-1">Manage your team and payroll</p>
          </div>
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition-all shadow-lg">
            <FiPlus /> Add Employee
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Staff', value: employees.length, icon: <FiUsers />, color: 'text-blue-400' },
            { label: 'Active', value: activeCount, icon: <FiUsers />, color: 'text-green-400' },
            { label: 'On Leave', value: onLeave, icon: <FiClock />, color: 'text-yellow-400' },
            { label: 'Monthly Payroll', value: `KES ${totalPayroll.toLocaleString()}`, icon: <FiDollarSign />, color: 'text-orange-400' },
          ].map((s, i) => (
            <div key={i} className="bg-gray-800 rounded-xl border border-gray-700 p-4">
              <div className={`${s.color} mb-2`}>{s.icon}</div>
              <p className="text-gray-400 text-xs">{s.label}</p>
              <p className="text-white text-xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, role or phone..."
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500">
            <option value="all">All Roles</option>
            {roles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Employee</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 hidden sm:table-cell">Role</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 hidden md:table-cell">Shift</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 hidden lg:table-cell">Salary</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 hidden xl:table-cell">Attendance</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filtered.map(emp => (
                  <tr key={emp.id} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{emp.name}</p>
                          <p className="text-gray-400 text-xs flex items-center gap-1">
                            <FiPhone size={10} />{emp.phone}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300 text-sm hidden sm:table-cell">{emp.role}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs hidden md:table-cell">{emp.shift}</td>
                    <td className="px-4 py-3 text-orange-400 font-semibold text-sm hidden lg:table-cell">KES {emp.salary.toLocaleString()}</td>
                    <td className="px-4 py-3 hidden xl:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-700 rounded-full h-1.5 w-16">
                          <div className="h-1.5 rounded-full bg-green-500" style={{ width: `${emp.attendance}%` }} />
                        </div>
                        <span className="text-gray-300 text-xs">{emp.attendance}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[emp.status]}`}>
                        {emp.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(emp)} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"><FiEdit2 size={14} /></button>
                        <button onClick={() => handleDelete(emp.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><FiTrash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12">
                <FiUsers className="mx-auto text-gray-600 mb-3" size={48} />
                <p className="text-gray-400 mb-2">No employees found</p>
                <p className="text-gray-500 text-sm">Add your first employee to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl w-full max-w-md border border-gray-700 shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">{editEmp ? 'Edit Employee' : 'Add Employee'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><FiX size={22} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Full Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Alice Njeri" className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
                  <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className={inputClass}>
                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Shift</label>
                  <select value={form.shift} onChange={e => setForm({ ...form, shift: e.target.value })} className={inputClass}>
                    {shifts.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Phone *</label>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="254711000001" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Monthly Salary (KES)</label>
                <input type="number" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} placeholder="25000" className={inputClass} />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">Cancel</button>
                <button onClick={handleSave} className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition-all shadow-lg">
                  {editEmp ? 'Save Changes' : 'Add Employee'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;

