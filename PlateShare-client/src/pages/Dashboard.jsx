import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3, Check, ChevronLeft, ChevronRight, ClipboardList,
  Eye, LayoutDashboard, LineChart, Mail, Menu, Package,
  PanelLeftClose, PanelLeftOpen, PieChart, Plus, RefreshCw,
  Search, Settings, Shield, Tags, Trash2, Users, X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { usePlateShare } from '../context/usePlateShare';
import Badge from '../components/UI/Badge';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import Input from '../components/UI/Input';
import Loading from '../components/UI/Loading';
import Modal from '../components/UI/Modal';
import Table from '../components/UI/Table';

const userLinks = [
  ['overview', 'Overview', LayoutDashboard],
  ['my-food', 'My food shares', Package],
  ['requests', 'Requests', ClipboardList],
  ['analytics', 'Analytics', BarChart3],
  ['profile', 'Profile & settings', Settings],
];
const adminLinks = [
  ['overview', 'Overview', LayoutDashboard],
  ['users', 'Users', Users],
  ['my-food', 'Food listings', Package],
  ['requests', 'Food requests', ClipboardList],
  ['contacts', 'Contact submissions', Mail],
  ['analytics', 'Analytics', BarChart3],
  ['categories', 'Categories', Tags],
  ['profile', 'Profile & settings', Settings],
];

const dateLabel = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? '—' : date.toLocaleDateString();
};

function Metric({ label, value, detail, icon: Icon }) {
  return <article className="dashboard-metric"><span className="dashboard-metric-icon"><Icon size={17} /></span><span>{label}</span><strong>{Number(value || 0).toLocaleString()}</strong><small>{detail}</small></article>;
}

function ChartBars({ items = [], label }) {
  const maximum = Math.max(1, ...items.map((item) => Number(item.value) || 0));
  if (!items.length) return <p className="empty-state compact">No data yet.</p>;
  return <div className="dashboard-chart-bars" role="img" aria-label={label}>{items.slice(0, 8).map((item) => <div className="dashboard-chart-bar" key={`${item.label || item.date}`}><strong>{item.value}</strong><span style={{ height: `${Math.max(8, (item.value / maximum) * 100)}%` }} /><small>{item.label || item.date}</small></div>)}</div>;
}

function ChartLine({ items = [], label }) {
  if (!items.length) return <p className="empty-state compact">No activity yet.</p>;
  const maximum = Math.max(1, ...items.map((item) => Number(item.value) || 0));
  return <div className="dashboard-line-chart" role="img" aria-label={label}><div className="dashboard-line-points">{items.slice(-12).map((item) => <span key={item.date} title={`${item.date}: ${item.value}`} style={{ bottom: `${Math.max(5, (item.value / maximum) * 90)}%` }} />)}</div><div className="dashboard-line-labels">{items.slice(-6).map((item) => <small key={item.date}>{item.date}</small>)}</div></div>;
}

function ChartLegend({ items = [], label }) {
  if (!items.length) return <p className="empty-state compact">No data yet.</p>;
  return <div className="dashboard-legend" aria-label={label}>{items.map((item, index) => <div key={item.label}><span className={`legend-dot legend-dot-${index % 5}`} /><span>{item.label}</span><strong>{item.value}</strong></div>)}</div>;
}

function EmptyPanel({ children, action }) {
  return <div className="dashboard-empty"><ClipboardList size={22} /><p>{children}</p>{action}</div>;
}

export default function Dashboard() {
  const { foods, categories, requests, user, refreshMyFoods, deleteFood, updateRequest, addCategory, deleteCategory } = usePlateShare();
  const [active, setActive] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [userPage, setUserPage] = useState(1);
  const [userPages, setUserPages] = useState(1);
  const [userTotal, setUserTotal] = useState(0);
  const [userSearch, setUserSearch] = useState('');
  const [contacts, setContacts] = useState([]);
  const [contactPage, setContactPage] = useState(1);
  const [contactPages, setContactPages] = useState(1);
  const [contactTotal, setContactTotal] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [workingId, setWorkingId] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [categorySuccess, setCategorySuccess] = useState('');
  const [categorySaving, setCategorySaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const isAdmin = user.role === 'admin';
  const links = isAdmin ? adminLinks : userLinks;
  const ownedFoods = useMemo(() => foods.filter((food) => isAdmin || food.ownerId === user._id), [foods, isAdmin, user._id]);
  const visibleRequests = useMemo(() => requests.filter((request) => isAdmin || request.userId === user._id || ownedFoods.some((food) => food._id === request.foodId)), [requests, isAdmin, user._id, ownedFoods]);
  const activeTitle = links.find(([id]) => id === active)?.[1] || 'Overview';
  const pending = visibleRequests.filter((request) => request.status === 'pending').length;

  const loadAnalytics = async () => {
    setLoading(true); setError('');
    try { setAnalytics(await api(isAdmin ? '/admin/analytics' : '/analytics')); } catch (requestError) { setError(requestError.message); } finally { setLoading(false); }
  };
  const loadUsers = async () => {
    setLoading(true); setError('');
    try { const search = userSearch.trim() ? `&search=${encodeURIComponent(userSearch.trim())}` : ''; const data = await api(`/admin/users?page=${userPage}&limit=10${search}`); setAdminUsers(data.items); setUserTotal(data.total); setUserPages(data.pages); } catch (requestError) { setError(requestError.message); } finally { setLoading(false); }
  };
  const loadContacts = async () => {
    setLoading(true); setError('');
    try { const data = await api(`/admin/contacts?page=${contactPage}&limit=10`); setContacts(data.items); setContactTotal(data.total); setContactPages(data.pages); } catch (requestError) { setError(requestError.message); } finally { setLoading(false); }
  };

  useEffect(() => { refreshMyFoods().catch((requestError) => setError(requestError.message)); }, [refreshMyFoods]);
  useEffect(() => {
    // These loaders synchronize the dashboard with the active server-backed section.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (active === 'analytics' || active === 'overview') loadAnalytics();
    if (active === 'users' && isAdmin) loadUsers();
    if (active === 'contacts' && isAdmin) loadContacts();
    // The loaders are stable for the active dashboard session and intentionally share this trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, isAdmin, userPage, contactPage, userSearch]);

  const selectSection = (section) => { setActive(section); setMobileOpen(false); setError(''); if (section === 'users') setUserPage(1); if (section === 'contacts') setContactPage(1); };
  const searchUsers = (value) => { setUserSearch(value); setUserPage(1); };
  const removeFood = (food) => setDeleteTarget({ type: 'food', item: food });
  const removeCategory = (category) => setDeleteTarget({ type: 'category', item: category });
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setWorkingId(deleteTarget.item._id); setError('');
    try { if (deleteTarget.type === 'food') await deleteFood(deleteTarget.item._id); else await deleteCategory(deleteTarget.item._id); setDeleteTarget(null); } catch (requestError) { setError(requestError.message); } finally { setWorkingId(''); }
  };
  const decide = async (request, status) => {
    setWorkingId(request._id); setError('');
    try { await updateRequest(request._id, status); } catch (requestError) { setError(requestError.message); } finally { setWorkingId(''); }
  };
  const changeRole = async (target, role) => {
    setWorkingId(target._id); setError('');
    try { await api(`/admin/users/${target._id}/role`, { method: 'PATCH', body: { role } }); setAdminUsers((current) => current.map((item) => item._id === target._id ? { ...item, role } : item)); } catch (requestError) { setError(requestError.message); } finally { setWorkingId(''); }
  };
  const createCategory = async (event) => {
    event.preventDefault(); setError(''); setCategorySuccess(''); setCategorySaving(true);
    try { await addCategory(categoryName); setCategoryName(''); setCategorySuccess('Category added and available in food forms.'); } catch (requestError) { setError(requestError.message); } finally { setCategorySaving(false); }
  };

  const totals = analytics?.totals || {};
  const foodTotal = isAdmin ? totals.foods : totals.foods ?? ownedFoods.length;
  const requestTotal = isAdmin ? totals.requests : totals.requests ?? visibleRequests.length;

  return <main className="dashboard-page">
    {mobileOpen && <button className="dashboard-overlay" aria-label="Close dashboard menu" onClick={() => setMobileOpen(false)} />}
    <div className={`dashboard-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <aside className={`dashboard-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="dashboard-sidebar-header"><div className="dashboard-person"><span className="dashboard-avatar">{user.name[0]?.toUpperCase()}</span>{!sidebarCollapsed && <span><strong>{user.name}</strong><small>{isAdmin ? 'Community admin' : 'Community member'}</small></span>}</div><button className="sidebar-collapse" type="button" onClick={() => setSidebarCollapsed((value) => !value)} aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>{sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}</button></div>
        {!sidebarCollapsed && <p className="sidebar-label">Workspace</p>}
        <nav aria-label="Dashboard sections">{links.map(([id, label, Icon]) => <button key={id} className={active === id ? 'active' : ''} onClick={() => selectSection(id)} title={sidebarCollapsed ? label : undefined}><Icon size={18} /><span>{!sidebarCollapsed && label}</span></button>)}</nav>
        {!sidebarCollapsed && <div className="sidebar-bottom"><Link to="/add-food"><Plus size={17} /> Share food</Link><Link to="/"><span aria-hidden="true">↗</span> Return to PlateShare</Link></div>}
      </aside>
      <section className="dashboard-main">
        <div className="dashboard-heading"><button type="button" className="dashboard-mobile-toggle" onClick={() => setMobileOpen(true)} aria-label="Open dashboard menu"><Menu size={20} /></button><div><p className="eyebrow">{isAdmin ? 'Community administration' : 'Your community space'}</p><h1>{active === 'overview' ? `Hello, ${user.name.split(' ')[0]}.` : activeTitle}</h1><p>{isAdmin ? 'Keep the PlateShare community healthy and connected.' : 'Manage your food shares and community requests.'}</p></div><Button to="/add-food"><Plus size={17} /> Add a food share</Button></div>
        {error && <div className="dashboard-alert" role="alert"><span>{error}</span><Button variant="text" onClick={() => setError('')} aria-label="Dismiss error"><X size={16} /></Button></div>}
        {active === 'overview' && <Overview isAdmin={isAdmin} analytics={analytics} loading={loading} foodTotal={foodTotal} requestTotal={requestTotal} pending={pending} ownedFoods={ownedFoods} visibleRequests={visibleRequests} onSection={selectSection} />}
        {active === 'my-food' && <FoodListings foods={ownedFoods} isAdmin={isAdmin} onDelete={removeFood} workingId={workingId} />}
        {active === 'requests' && <Requests requests={visibleRequests} foods={ownedFoods} isAdmin={isAdmin} workingId={workingId} onDecide={decide} />}
        {active === 'analytics' && <AnalyticsPanel analytics={analytics} loading={loading} isAdmin={isAdmin} onRetry={loadAnalytics} />}
        {active === 'profile' && <ProfilePanel user={user} />}
    {active === 'users' && isAdmin && <UsersPanel users={adminUsers} total={userTotal} page={userPage} pages={userPages} search={userSearch} loading={loading} workingId={workingId} onSearch={searchUsers} onPage={setUserPage} onRole={changeRole} onRetry={loadUsers} />}
        {active === 'contacts' && isAdmin && <ContactsPanel contacts={contacts} total={contactTotal} page={contactPage} pages={contactPages} loading={loading} onPage={setContactPage} onRetry={loadContacts} />}
        {active === 'categories' && isAdmin && <CategoriesPanel categories={categories} name={categoryName} success={categorySuccess} saving={categorySaving} onName={setCategoryName} onCreate={createCategory} onDelete={removeCategory} workingId={workingId} />}
      </section>
    </div>
    <Modal open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title={`Delete ${deleteTarget?.type === 'category' ? 'category' : 'food share'}?`}><p className="modal-copy">This action cannot be undone. {deleteTarget?.type === 'food' ? 'Any requests for this listing will also be removed.' : 'Existing food listings using it may prevent deletion.'}</p><div className="modal-actions"><Button variant="light" onClick={() => setDeleteTarget(null)}>Cancel</Button><Button loading={Boolean(workingId)} onClick={confirmDelete}>Delete</Button></div></Modal>
  </main>;
}

function Overview({ isAdmin, analytics, loading, foodTotal, requestTotal, pending, ownedFoods, visibleRequests, onSection }) {
  const totals = analytics?.totals || {};
  return <><div className="dashboard-stats dashboard-metric-grid"><Metric label={isAdmin ? 'Total users' : 'My food shares'} value={isAdmin ? totals.users : foodTotal} detail="Live database total" icon={isAdmin ? Users : Package} /><Metric label={isAdmin ? 'Food listings' : 'Requests'} value={isAdmin ? totals.foods : requestTotal} detail={isAdmin ? `${totals.availableFoods || 0} available` : `${pending} need a response`} icon={isAdmin ? Package : ClipboardList} /><Metric label={isAdmin ? 'Food requests' : 'Servings shared'} value={isAdmin ? totals.requests : totals.servings || ownedFoods.reduce((sum, food) => sum + Number(food.quantity || 0), 0)} detail={isAdmin ? 'All recorded requests' : 'Across your listings'} icon={isAdmin ? ClipboardList : BarChart3} /></div><div className="dashboard-panels"><Card className="dashboard-panel"><div className="panel-title"><div><p className="eyebrow">{isAdmin ? 'Platform activity' : 'Your activity'}</p><h2>Food shares by category</h2></div><BarChart3 size={19} /></div>{loading ? <Loading label="Loading analytics…" className="loading-compact" /> : <ChartBars items={analytics?.charts?.foodByCategory} label="Food shares by category" />}<Button variant="text" className="text-link" onClick={() => onSection('analytics')}>Open analytics <Eye size={16} /></Button></Card><Card className="dashboard-panel activity-panel"><div className="panel-title"><div><p className="eyebrow">Recent activity</p><h2>Latest requests</h2></div><ClipboardList size={19} /></div>{visibleRequests.slice(0, 4).map((request) => <div className="activity-row" key={request._id}><span className="activity-dot" /><span><strong>{request.name}</strong><small>{request.foodTitle}</small></span><Badge className={`status status-${request.status}`}>{request.status}</Badge></div>)}{!visibleRequests.length && <EmptyPanel>No requests have been recorded yet.</EmptyPanel>}<Button variant="text" className="text-link" onClick={() => onSection('requests')}>Manage requests <Eye size={16} /></Button></Card></div></>;
}

function FoodListings({ foods, isAdmin, onDelete, workingId }) {
  return <section className="dashboard-panel table-panel"><div className="panel-title"><div><p className="eyebrow">{isAdmin ? 'Community listings' : 'Your listings'}</p><h2>{foods.length} food shares</h2></div><Button to="/add-food" variant="outline"><Plus size={16} /> Add listing</Button></div>{foods.length ? <Table><table><thead><tr><th>Food</th><th>Category</th><th>Quantity</th><th>Status</th><th>Posted</th><th>Actions</th></tr></thead><tbody>{foods.map((food) => <tr key={food._id}><td><Link className="table-food" to={`/foods/${food._id}`}><img src={food.image} alt="" loading="lazy" />{food.title}</Link></td><td>{food.category}</td><td>{food.quantity}</td><td><Badge className={`status status-${food.status}`}>{food.status || 'available'}</Badge></td><td>{dateLabel(food.createdAt)}</td><td className="table-actions"><Link to={`/foods/${food._id}`} aria-label={`View ${food.title}`}><Eye size={16} /></Link><Link to={`/edit-food/${food._id}`} aria-label={`Edit ${food.title}`}><Settings size={16} /></Link><Button variant="icon" disabled={workingId === food._id} onClick={() => onDelete(food)} aria-label={`Delete ${food.title}`}><Trash2 size={16} /></Button></td></tr>)}</tbody></table></Table> : <EmptyPanel action={<Button to="/add-food" variant="outline"><Plus size={15} /> Share your first food</Button>}>You have not shared food yet.</EmptyPanel>}</section>;
}

function Requests({ requests, foods, isAdmin, workingId, onDecide }) {
  return <section className="dashboard-panel table-panel"><div className="panel-title"><div><p className="eyebrow">Requests received and sent</p><h2>{requests.length} requests</h2></div></div>{requests.length ? <Table><table><thead><tr><th>Food</th><th>Neighbour</th><th>Message</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead><tbody>{requests.map((request) => { const canDecide = isAdmin || foods.some((food) => food._id === request.foodId); return <tr key={request._id}><td><Link to={`/foods/${request.foodId}`} className="text-link">{request.foodTitle}</Link></td><td>{request.name}<small className="table-subtext">{request.userEmail}</small></td><td className="request-message">{request.message || 'No message'}</td><td><Badge className={`status status-${request.status}`}>{request.status}</Badge></td><td>{dateLabel(request.createdAt)}</td><td>{canDecide && request.status === 'pending' ? <span className="table-actions"><Button variant="icon" disabled={workingId === request._id} onClick={() => onDecide(request, 'accepted')} aria-label="Accept request"><Check size={16} /></Button><Button variant="icon" disabled={workingId === request._id} onClick={() => onDecide(request, 'rejected')} aria-label="Reject request"><X size={16} /></Button></span> : '—'}</td></tr>; })}</tbody></table></Table> : <EmptyPanel>No requests yet.</EmptyPanel>}</section>;
}

function AnalyticsPanel({ analytics, loading, isAdmin, onRetry }) {
  if (loading) return <Loading label="Loading analytics…" />;
  if (!analytics) return <EmptyPanel action={<Button variant="outline" onClick={onRetry}><RefreshCw size={15} /> Try again</Button>}>Analytics could not be loaded.</EmptyPanel>;
  const charts = analytics.charts || {};
  return <div className="dashboard-chart-grid"><Card className="dashboard-panel"><div className="panel-title"><div><p className="eyebrow">Bar chart</p><h2>Food by category</h2></div><BarChart3 size={19} /></div><ChartBars items={charts.foodByCategory} label="Food by category" /></Card><Card className="dashboard-panel"><div className="panel-title"><div><p className="eyebrow">Line chart</p><h2>Monthly food shares</h2></div><LineChart size={19} /></div><ChartLine items={charts.foodTrend} label="Monthly food shares" /></Card><Card className="dashboard-panel"><div className="panel-title"><div><p className="eyebrow">Pie data</p><h2>Request statuses</h2></div><PieChart size={19} /></div><ChartLegend items={charts.requestStatus} label="Request statuses" /></Card>{isAdmin && <Card className="dashboard-panel"><div className="panel-title"><div><p className="eyebrow">Pie data</p><h2>User roles</h2></div><Shield size={19} /></div><ChartLegend items={charts.userRoles} label="User roles" /></Card>}</div>;
}

function UsersPanel({ users, total, page, pages, search, loading, workingId, onSearch, onPage, onRole, onRetry }) {
  return <section className="dashboard-panel table-panel"><div className="panel-title"><div><p className="eyebrow">Admin-only account management</p><h2>{total} users</h2></div><Button variant="outline" size="sm" onClick={onRetry}><RefreshCw size={15} /> Refresh</Button></div><label className="dashboard-search"><Search size={16} /><span className="sr-only">Search users</span><input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search name or email" /></label>{loading ? <Loading label="Loading users…" className="loading-compact" /> : users.length ? <Table><table><thead><tr><th>Name</th><th>Email</th><th>Joined</th><th>Role</th></tr></thead><tbody>{users.map((item) => <tr key={item._id}><td>{item.name}</td><td>{item.email}</td><td>{dateLabel(item.createdAt)}</td><td><Input as="select" bare value={item.role} disabled={workingId === item._id} onChange={(event) => onRole(item, event.target.value)} aria-label={`Role for ${item.name}`}><option value="user">User</option><option value="admin">Admin</option></Input></td></tr>)}</tbody></table></Table> : <EmptyPanel>No users match this search.</EmptyPanel>}<Pagination page={page} pages={pages} onPage={onPage} /></section>;
}

function ContactsPanel({ contacts, total, page, pages, loading, onPage, onRetry }) {
  return <section className="dashboard-panel table-panel"><div className="panel-title"><div><p className="eyebrow">Private admin inbox</p><h2>{total} contact submissions</h2></div><Button variant="outline" size="sm" onClick={onRetry}><RefreshCw size={15} /> Refresh</Button></div>{loading ? <Loading label="Loading contact submissions…" className="loading-compact" /> : contacts.length ? <Table><table><thead><tr><th>From</th><th>Email</th><th>Message</th><th>Received</th></tr></thead><tbody>{contacts.map((contact) => <tr key={contact._id}><td>{contact.name}</td><td><a className="text-link" href={`mailto:${contact.email}`}>{contact.email}</a></td><td className="request-message">{contact.message}</td><td>{dateLabel(contact.createdAt)}</td></tr>)}</tbody></table></Table> : <EmptyPanel>No contact submissions yet.</EmptyPanel>}<Pagination page={page} pages={pages} onPage={onPage} /></section>;
}

function CategoriesPanel({ categories, name, success, saving, onName, onCreate, onDelete, workingId }) {
  return <section className="dashboard-panel table-panel"><div className="panel-title"><div><p className="eyebrow">Food listing options</p><h2>Manage categories</h2></div></div><form className="category-create-form" onSubmit={onCreate}><Input id="category-name" name="category" label="New category" value={name} onChange={(event) => onName(event.target.value)} minLength={2} maxLength={40} placeholder="e.g. Dairy" required /><Button type="submit" loading={saving}>Add category</Button></form>{success && <p className="form-success" role="status">{success}</p>}<Table><table><thead><tr><th>Category</th><th>Slug</th><th>Action</th></tr></thead><tbody>{categories.map((category) => <tr key={category._id}><td>{category.name}</td><td>{category.slug}</td><td><Button variant="outline" size="sm" disabled={workingId === category._id} onClick={() => onDelete(category)}>Remove</Button></td></tr>)}</tbody></table></Table><p className="chart-note">A category cannot be removed while food listings use it.</p></section>;
}

function ProfilePanel({ user }) {
  return <section className="dashboard-panel profile-shortcut"><span className="dashboard-avatar"><Shield size={18} /></span><div><h2>{user.name}</h2><p>{user.email} · {user.role === 'admin' ? 'Administrator' : 'Community member'}</p></div><Link to="/profile" className="text-link">Edit profile <Settings size={16} /></Link></section>;
}

function Pagination({ page, pages, onPage }) {
  if (pages <= 1) return null;
  return <nav className="dashboard-pagination" aria-label="Dashboard pages"><Button variant="pagination" size="sm" disabled={page === 1} onClick={() => onPage(page - 1)}><ChevronLeft size={15} /> Previous</Button><span>Page {page} of {pages}</span><Button variant="pagination" size="sm" disabled={page === pages} onClick={() => onPage(page + 1)}>Next <ChevronRight size={15} /></Button></nav>;
}
