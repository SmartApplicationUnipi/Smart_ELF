//------------------------------------------------------------------------------
// <auto-generated />
//
// This file was automatically generated by SWIG (http://www.swig.org).
// Version 3.0.12
//
// Do not make changes to this file unless you know what you are doing--modify
// the SWIG interface file instead.
//------------------------------------------------------------------------------


public class PidVector : global::System.IDisposable, global::System.Collections.IEnumerable
    , global::System.Collections.Generic.IEnumerable<Pid>
 {
  private global::System.Runtime.InteropServices.HandleRef swigCPtr;
  protected bool swigCMemOwn;

  internal PidVector(global::System.IntPtr cPtr, bool cMemoryOwn) {
    swigCMemOwn = cMemoryOwn;
    swigCPtr = new global::System.Runtime.InteropServices.HandleRef(this, cPtr);
  }

  internal static global::System.Runtime.InteropServices.HandleRef getCPtr(PidVector obj) {
    return (obj == null) ? new global::System.Runtime.InteropServices.HandleRef(null, global::System.IntPtr.Zero) : obj.swigCPtr;
  }

  ~PidVector() {
    Dispose();
  }

  public virtual void Dispose() {
    lock(this) {
      if (swigCPtr.Handle != global::System.IntPtr.Zero) {
        if (swigCMemOwn) {
          swigCMemOwn = false;
          yarpPINVOKE.delete_PidVector(swigCPtr);
        }
        swigCPtr = new global::System.Runtime.InteropServices.HandleRef(null, global::System.IntPtr.Zero);
      }
      global::System.GC.SuppressFinalize(this);
    }
  }

  public PidVector(global::System.Collections.ICollection c) : this() {
    if (c == null)
      throw new global::System.ArgumentNullException("c");
    foreach (Pid element in c) {
      this.Add(element);
    }
  }

  public bool IsFixedSize {
    get {
      return false;
    }
  }

  public bool IsReadOnly {
    get {
      return false;
    }
  }

  public Pid this[int index]  {
    get {
      return getitem(index);
    }
    set {
      setitem(index, value);
    }
  }

  public int Capacity {
    get {
      return (int)capacity();
    }
    set {
      if (value < size())
        throw new global::System.ArgumentOutOfRangeException("Capacity");
      reserve((uint)value);
    }
  }

  public int Count {
    get {
      return (int)size();
    }
  }

  public bool IsSynchronized {
    get {
      return false;
    }
  }

  public void CopyTo(Pid[] array)
  {
    CopyTo(0, array, 0, this.Count);
  }

  public void CopyTo(Pid[] array, int arrayIndex)
  {
    CopyTo(0, array, arrayIndex, this.Count);
  }

  public void CopyTo(int index, Pid[] array, int arrayIndex, int count)
  {
    if (array == null)
      throw new global::System.ArgumentNullException("array");
    if (index < 0)
      throw new global::System.ArgumentOutOfRangeException("index", "Value is less than zero");
    if (arrayIndex < 0)
      throw new global::System.ArgumentOutOfRangeException("arrayIndex", "Value is less than zero");
    if (count < 0)
      throw new global::System.ArgumentOutOfRangeException("count", "Value is less than zero");
    if (array.Rank > 1)
      throw new global::System.ArgumentException("Multi dimensional array.", "array");
    if (index+count > this.Count || arrayIndex+count > array.Length)
      throw new global::System.ArgumentException("Number of elements to copy is too large.");
    for (int i=0; i<count; i++)
      array.SetValue(getitemcopy(index+i), arrayIndex+i);
  }

  global::System.Collections.Generic.IEnumerator<Pid> global::System.Collections.Generic.IEnumerable<Pid>.GetEnumerator() {
    return new PidVectorEnumerator(this);
  }

  global::System.Collections.IEnumerator global::System.Collections.IEnumerable.GetEnumerator() {
    return new PidVectorEnumerator(this);
  }

  public PidVectorEnumerator GetEnumerator() {
    return new PidVectorEnumerator(this);
  }

  // Type-safe enumerator
  /// Note that the IEnumerator documentation requires an InvalidOperationException to be thrown
  /// whenever the collection is modified. This has been done for changes in the size of the
  /// collection but not when one of the elements of the collection is modified as it is a bit
  /// tricky to detect unmanaged code that modifies the collection under our feet.
  public sealed class PidVectorEnumerator : global::System.Collections.IEnumerator
    , global::System.Collections.Generic.IEnumerator<Pid>
  {
    private PidVector collectionRef;
    private int currentIndex;
    private object currentObject;
    private int currentSize;

    public PidVectorEnumerator(PidVector collection) {
      collectionRef = collection;
      currentIndex = -1;
      currentObject = null;
      currentSize = collectionRef.Count;
    }

    // Type-safe iterator Current
    public Pid Current {
      get {
        if (currentIndex == -1)
          throw new global::System.InvalidOperationException("Enumeration not started.");
        if (currentIndex > currentSize - 1)
          throw new global::System.InvalidOperationException("Enumeration finished.");
        if (currentObject == null)
          throw new global::System.InvalidOperationException("Collection modified.");
        return (Pid)currentObject;
      }
    }

    // Type-unsafe IEnumerator.Current
    object global::System.Collections.IEnumerator.Current {
      get {
        return Current;
      }
    }

    public bool MoveNext() {
      int size = collectionRef.Count;
      bool moveOkay = (currentIndex+1 < size) && (size == currentSize);
      if (moveOkay) {
        currentIndex++;
        currentObject = collectionRef[currentIndex];
      } else {
        currentObject = null;
      }
      return moveOkay;
    }

    public void Reset() {
      currentIndex = -1;
      currentObject = null;
      if (collectionRef.Count != currentSize) {
        throw new global::System.InvalidOperationException("Collection modified.");
      }
    }

    public void Dispose() {
        currentIndex = -1;
        currentObject = null;
    }
  }

  public void Clear() {
    yarpPINVOKE.PidVector_Clear(swigCPtr);
  }

  public void Add(Pid x) {
    yarpPINVOKE.PidVector_Add(swigCPtr, Pid.getCPtr(x));
    if (yarpPINVOKE.SWIGPendingException.Pending) throw yarpPINVOKE.SWIGPendingException.Retrieve();
  }

  private uint size() {
    uint ret = yarpPINVOKE.PidVector_size(swigCPtr);
    return ret;
  }

  private uint capacity() {
    uint ret = yarpPINVOKE.PidVector_capacity(swigCPtr);
    return ret;
  }

  private void reserve(uint n) {
    yarpPINVOKE.PidVector_reserve(swigCPtr, n);
  }

  public PidVector() : this(yarpPINVOKE.new_PidVector__SWIG_0(), true) {
  }

  public PidVector(PidVector other) : this(yarpPINVOKE.new_PidVector__SWIG_1(PidVector.getCPtr(other)), true) {
    if (yarpPINVOKE.SWIGPendingException.Pending) throw yarpPINVOKE.SWIGPendingException.Retrieve();
  }

  public PidVector(int capacity) : this(yarpPINVOKE.new_PidVector__SWIG_2(capacity), true) {
    if (yarpPINVOKE.SWIGPendingException.Pending) throw yarpPINVOKE.SWIGPendingException.Retrieve();
  }

  private Pid getitemcopy(int index) {
    Pid ret = new Pid(yarpPINVOKE.PidVector_getitemcopy(swigCPtr, index), true);
    if (yarpPINVOKE.SWIGPendingException.Pending) throw yarpPINVOKE.SWIGPendingException.Retrieve();
    return ret;
  }

  private Pid getitem(int index) {
    Pid ret = new Pid(yarpPINVOKE.PidVector_getitem(swigCPtr, index), false);
    if (yarpPINVOKE.SWIGPendingException.Pending) throw yarpPINVOKE.SWIGPendingException.Retrieve();
    return ret;
  }

  private void setitem(int index, Pid val) {
    yarpPINVOKE.PidVector_setitem(swigCPtr, index, Pid.getCPtr(val));
    if (yarpPINVOKE.SWIGPendingException.Pending) throw yarpPINVOKE.SWIGPendingException.Retrieve();
  }

  public void AddRange(PidVector values) {
    yarpPINVOKE.PidVector_AddRange(swigCPtr, PidVector.getCPtr(values));
    if (yarpPINVOKE.SWIGPendingException.Pending) throw yarpPINVOKE.SWIGPendingException.Retrieve();
  }

  public PidVector GetRange(int index, int count) {
    global::System.IntPtr cPtr = yarpPINVOKE.PidVector_GetRange(swigCPtr, index, count);
    PidVector ret = (cPtr == global::System.IntPtr.Zero) ? null : new PidVector(cPtr, true);
    if (yarpPINVOKE.SWIGPendingException.Pending) throw yarpPINVOKE.SWIGPendingException.Retrieve();
    return ret;
  }

  public void Insert(int index, Pid x) {
    yarpPINVOKE.PidVector_Insert(swigCPtr, index, Pid.getCPtr(x));
    if (yarpPINVOKE.SWIGPendingException.Pending) throw yarpPINVOKE.SWIGPendingException.Retrieve();
  }

  public void InsertRange(int index, PidVector values) {
    yarpPINVOKE.PidVector_InsertRange(swigCPtr, index, PidVector.getCPtr(values));
    if (yarpPINVOKE.SWIGPendingException.Pending) throw yarpPINVOKE.SWIGPendingException.Retrieve();
  }

  public void RemoveAt(int index) {
    yarpPINVOKE.PidVector_RemoveAt(swigCPtr, index);
    if (yarpPINVOKE.SWIGPendingException.Pending) throw yarpPINVOKE.SWIGPendingException.Retrieve();
  }

  public void RemoveRange(int index, int count) {
    yarpPINVOKE.PidVector_RemoveRange(swigCPtr, index, count);
    if (yarpPINVOKE.SWIGPendingException.Pending) throw yarpPINVOKE.SWIGPendingException.Retrieve();
  }

  public static PidVector Repeat(Pid value, int count) {
    global::System.IntPtr cPtr = yarpPINVOKE.PidVector_Repeat(Pid.getCPtr(value), count);
    PidVector ret = (cPtr == global::System.IntPtr.Zero) ? null : new PidVector(cPtr, true);
    if (yarpPINVOKE.SWIGPendingException.Pending) throw yarpPINVOKE.SWIGPendingException.Retrieve();
    return ret;
  }

  public void Reverse() {
    yarpPINVOKE.PidVector_Reverse__SWIG_0(swigCPtr);
  }

  public void Reverse(int index, int count) {
    yarpPINVOKE.PidVector_Reverse__SWIG_1(swigCPtr, index, count);
    if (yarpPINVOKE.SWIGPendingException.Pending) throw yarpPINVOKE.SWIGPendingException.Retrieve();
  }

  public void SetRange(int index, PidVector values) {
    yarpPINVOKE.PidVector_SetRange(swigCPtr, index, PidVector.getCPtr(values));
    if (yarpPINVOKE.SWIGPendingException.Pending) throw yarpPINVOKE.SWIGPendingException.Retrieve();
  }

}
